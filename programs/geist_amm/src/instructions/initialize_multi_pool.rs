use anchor_lang::prelude::*;
use anchor_spl::token::{
    Token,
    Mint,
    TokenAccount,
    spl_token::state::AccountState,
    Transfer,
    transfer
};
use anchor_spl::associated_token::get_associated_token_address;
use crate::constants::*;
use crate::program;
use crate::states::*;
use crate::errors::GeistError;

pub fn initialize_multi_pool<'a>(
    ctx: Context<'_, '_, '_, 'a, InitializeMultiPool<'a>>,
    deposits: Vec<u64>,
) -> Result<()> {
    let admin = &ctx.accounts.admin;
    let core = &ctx.accounts.core;
    let multi_pool = &ctx.accounts.multi_pool;
    let token_program = &ctx.accounts.token_program;

    // Remaining accounts have to be provided in the following schema:
    // (stablecoin, stablecoin_vault, stablecoin_admin_ata)
    // If user is not depositing some stablecoin at the moment of pool initialization
    // their ATA doesn't have to be initialized - needs to be provided though for the program 
    // simplicity.

    let groups = ctx.remaining_accounts;
    require!(
        groups.len() % 3 == 0,
        GeistError::InvalidRemainingAccountsSchema
    );

    let groups_count = (groups.len() % 3) as usize;

    let mut balances: Vec<u64> = Vec::new();
    for n in 0..groups_count {
        // Stablecoin mint
        let stablecoin_mint_account_info = &groups[n * 3];
        ctx.accounts.validate_stablecoin_mint(stablecoin_mint_account_info.key)?;

        let stablecoin_mint_data = stablecoin_mint_account_info.try_borrow_mut_data()?;
        let stablecoin_mint = Mint::try_deserialize(&mut stablecoin_mint_data.as_ref())?;

        // Stablecoin vault
        let stablecoin_vault_account_info = &groups[n * 3 + 1];
        let stablecoin_vault_data = stablecoin_vault_account_info.try_borrow_mut_data()?;
        let stablecoin_vault = TokenAccount::try_deserialize(&mut stablecoin_vault_data.as_ref())?;

        balances.push(stablecoin_vault.amount);
        
        ctx.accounts.validate_stablecoin_vault(
            stablecoin_vault, 
            stablecoin_mint_account_info.key,
            stablecoin_mint_account_info.key
        )?;

        /// Stablecoin admin ata
        let stablecoin_admin_ata_account_info = &groups[n * 3 + 2];
        let stablecoin_admin_ata_data = stablecoin_admin_ata_account_info.try_borrow_mut_data()?;
        let stablecoin_admin_ata = TokenAccount::try_deserialize(&mut stablecoin_admin_ata_data.as_ref())?;

        ctx.accounts.validate_stablecoin_admin_ata(
            &stablecoin_admin_ata,
            stablecoin_admin_ata_account_info.key,
            stablecoin_mint_account_info.key,
            deposits[n]
        );

        // If user deposits this token, transfer to LP.
        let deposit = deposits[n];
        if (deposit > 0) {
            transfer(
                CpiContext::new(
                    token_program.clone().to_account_info(), 
                    Transfer {
                        authority: stablecoin_admin_ata_account_info.clone(),
                        from: stablecoin_admin_ata_account_info.clone(),
                        to: stablecoin_vault_account_info.clone()
                    }
                ),
                deposit
            )?;
        }
    }

    let lp_tokens =

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeMultiPool<'info> {
    #[account(
        mut
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [
            CORE_SEED.as_bytes()
        ],
        bump,
        constraint = !core.is_frozen
    )]
    pub core: Account<'info, Core>,

    #[account(
        init,
        payer = admin,
        seeds = [
            BINARY_POOL_SEED.as_bytes(),
            &core.next_pool_id.to_le_bytes()
        ],
        space = BinaryPool::INITIAL_SIZE as usize,
        bump,
    )]
    pub multi_pool: Account<'info, MultiPool>,

    #[account()]
    pub token_program: Program<'info, Token>,

    #[account()]
    pub system_program: Program<'info, System>,
}

impl InitializeMultiPool<'_> {
    pub fn validate_stablecoin_mint(
        &self,
        mint: &Pubkey
    ) -> Result<()> {
        // Stablecoin must be supported by the protocol
        // to be added to a pool.
        require!(
            self.core.supported_stablecoins.contains(mint),
            GeistError::StablecoinNotSupported
        );

        Ok(())
    }

    pub fn validate_stablecoin_vault(
        &self,
        vault: TokenAccount,
        vault_key: &Pubkey,
        stablecoin_mint: &Pubkey
    ) -> Result<()> {
        // Vault must be owned by the LP.
        require!(
            vault.owner == self.multi_pool.key(),
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
                self.multi_pool.key().as_ref(),
                stablecoin_mint.key().as_ref()
            ], 
            &program::Geist::id()
        );

        require!(
            rederived_vault.key() == *vault_key,
            GeistError::InvalidVault
        );

        Ok(())
    }

    pub fn validate_stablecoin_admin_ata(
        &self,
        ata: &TokenAccount,
        ata_key: &Pubkey,
        mint: &Pubkey,
        deposit: u64,
    ) -> Result<()> {
        // Rederive ata and compare
        let rederived_ata = get_associated_token_address(
            self.admin.key,
            mint
        );

        require!(
            *ata_key == rederived_ata,
            GeistError::InvalidTokenAccount
        );
        
        // If admin is depositing from this ata, make sure the account is initialized and has enough funds.
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