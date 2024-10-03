use anchor_lang::prelude::*;
use anchor_spl::token::{
    Token,
    TokenAccount,
    Mint,
    spl_token::state::AccountState
};
use anchor_spl::associated_token::*;
use crate::states::*;
use crate::constants::*;
use crate::errors::GeistError;
use crate::program::GeistAmm;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct LiquidityManagamentArgs {
    // Index of the pool affected by balance changes
    pub pool_id: u64,
}

#[derive(Accounts)]
#[instruction(
    args: LiquidityManagamentArgs
)]
pub struct LiquidityManagament<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            CORE_SEED.as_bytes()
        ],
        bump,
        constraint = !core.is_frozen @ GeistError::ProtocolFrozen
    )]
    pub core: Account<'info, Core>,

    #[account(
        mut,
        seeds = [
            BINARY_POOL_SEED.as_bytes(),
            &args.pool_id.to_le_bytes()
        ],
        bump,
        constraint = pool.index == args.pool_id @ GeistError::PoolIdMismatch,
        constraint = !pool.is_frozen @ GeistError::PoolFrozen
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        address = pool.lp_token,
    )]
    pub lp_token: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = lp_token,
        associated_token::authority = user,
    )]
    pub lp_token_user_ata: Account<'info, TokenAccount>,

    #[account()]
    pub token_program: Program<'info, Token>,
}

impl LiquidityManagament<'_> {
    pub fn validate_stablecoin_mint(
        &self,
        mint: &Pubkey
    ) -> Result<()> {
        // Stablecoin must be supported by the protocol
        // to be added to a pool. Can't be in withdraw mode.
        require!(
            self.core.supported_stablecoins.contains(mint),
            GeistError::StablecoinNotSupported
        );

        require!(
            self.pool.stablecoins.contains(mint),
            GeistError::StablecoinNotSupported
        );

        Ok(())
    }

    pub fn validate_stablecoin_vault(
        &self,
        vault: &TokenAccount,
        vault_key: &Pubkey,
        stablecoin_mint: &Pubkey
    ) -> Result<()> {
        // Vault must be owned by the LP.
        require!(
            vault.owner == self.pool.key(),
            GeistError::InvalidTokenAccountOwner
        );

        require!(
            vault.mint == *stablecoin_mint,
            GeistError::InvalidTokenAccountMint
        );

        // Rederive from bare seeds and compare.
        let (rederived_vault, _) = Pubkey::find_program_address(
            &[
                VAULT_SEED.as_bytes(),
                self.pool.key().as_ref(),
                stablecoin_mint.key().as_ref()
            ], 
            &GeistAmm::id()
        );

        require!(
            rederived_vault.key() == *vault_key,
            GeistError::InvalidVault
        );

        Ok(())
    }
    
    pub fn validate_stablecoin_user_ata(
        &self,
        ata: &TokenAccount,
        ata_key: &Pubkey,
        mint: &Pubkey,
        deposit: u64,
    ) -> Result<()> {
        // Rederive ata and compare
        let rederived_ata = get_associated_token_address(
            self.user.key,
            mint
        );

        require!(
            *ata_key == rederived_ata,
            GeistError::InvalidTokenAccount
        );
        
        // If user is depositing from this ata, make sure the account is initialized and has enough funds.
        if (deposit > 0) {
            require!(
                ata.state == AccountState::Initialized,
                GeistError::AtaNotInitialized
            );

            require!(
                ata.amount >= deposit,
                GeistError::NotEnoughFunds
            );
        }

        Ok(())
    }
}