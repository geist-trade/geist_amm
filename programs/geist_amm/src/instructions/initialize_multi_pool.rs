use anchor_lang::prelude::*;
use anchor_spl::token::{
    Token,
    Mint,
    TokenAccount,
    spl_token::state::AccountState,
    Transfer,
    transfer,
    MintTo,
    mint_to
};
use anchor_spl::associated_token::get_associated_token_address;
use crate::constants::*;
use crate::program;
use crate::states::*;
use crate::errors::GeistError;

pub fn initialize_multi_pool<'a>(
    ctx: Context<'_, '_, '_, 'a, InitializeMultiPool<'a>>,
    amp: u64,
    n_tokens: u64,
    deposits: Vec<u64>,
    fees: Fees
) -> Result<()> {
    let admin = &ctx.accounts.admin;
    let lp_token = &ctx.accounts.lp_token;
    let token_program = &ctx.accounts.token_program;
    let lp_token_admin_ata = &ctx.accounts.lp_token_admin_ata;

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

    // Only support initialization of pools with up to 8 tokens
    require!(
        n_tokens < 8,
        GeistError::InvalidInput
    );

    let groups_count = (groups.len() % 3) as usize;

    // Require user to provide correct number 
    // of account groups and correct length of deposit array.
    // No deposit == zeros.
    require!(
        groups.len() % 3 == (n_tokens as usize) && deposits.len() == (n_tokens as usize),
        GeistError::InvalidInput
    );

    let mut stablecoins: Vec<Pubkey> = Vec::new();
    let mut balances: Vec<u64> = Vec::new();
    for n in 0..groups_count {
        // Stablecoin mint
        let stablecoin_mint_account_info = &groups[n * 3];
        ctx.accounts.validate_stablecoin_mint(stablecoin_mint_account_info.key)?;

        let stablecoin_mint_data = stablecoin_mint_account_info.try_borrow_mut_data()?;
        let stablecoin_mint = Mint::try_deserialize(&mut stablecoin_mint_data.as_ref())?;
        stablecoins.push(stablecoin_mint_account_info.key());

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
        )?;

        // If user deposits this token, transfer to LP.
        let deposit = deposits[n];

        // TODO: Only validate accounts if we use them for deposits?
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

    let core = &mut ctx.accounts.core;
    let stable_swap = StableSwap::new(amp, n_tokens)?;
    let multi_pool = &mut ctx.accounts.multi_pool;

    multi_pool.admin = admin.key();
    multi_pool.amp = amp;
    multi_pool.swap = stable_swap;
    multi_pool.fees = fees;
    multi_pool.is_frozen = false;
    multi_pool.lp_token = lp_token.key();
    multi_pool.stablecoins = stablecoins;
    multi_pool.index = core.next_pool_id;

    let lp_tokens = multi_pool
        .swap
        .compute_lp_tokens_on_deposit_multi(
            &deposits, 
            &balances, 
            lp_token.supply
        )?;

    let signer_seeds = &[
        BINARY_POOL_SEED.as_bytes(),
        &core.next_pool_id.to_le_bytes(),
        &[ctx.bumps.multi_pool]
    ];

    mint_to(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            MintTo {
                authority: multi_pool.to_account_info(),
                mint: lp_token.to_account_info(),
                to: lp_token_admin_ata.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        lp_tokens
    )?;

    core.next_pool_id += 1;
    core.total_pools += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    n_tokens: u64,
    deposits: Vec<u64>,
)]
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
        space = MultiPool::INITIAL_SIZE as usize + ((n_tokens * 32) as usize),
        bump,
    )]
    pub multi_pool: Account<'info, MultiPool>,

    #[account(
        mut,
        constraint = lp_token.supply == 0 @ GeistError::LpTokenPreMinted,
        constraint = lp_token.mint_authority == Some(multi_pool.key()).into() @ GeistError::InvalidMintAuthority,
        constraint = lp_token.freeze_authority.is_none() @ GeistError::InvalidFreezeAuthority,
        constraint = lp_token.is_initialized @ GeistError::LpTokenNotInitialized
    )]
    pub lp_token: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = lp_token,
        associated_token::authority = admin,
    )]
    pub lp_token_admin_ata: Account<'info, TokenAccount>,

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
        // to be added to a pool. Can't be in withdraw mode.
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