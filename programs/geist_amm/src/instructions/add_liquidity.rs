use anchor_lang::prelude::*;
use crate::constants::*;
use crate::states::*;
use crate::errors::errors::*;
use crate::program;
use anchor_spl::token::{
    Mint,
    TokenAccount,
    MintTo,
    mint_to,
    Token,
    Transfer,
    transfer
};

// Similarly to initialize_multi_pool, add_liquidity accepts array of deposits.
// The array has to match the schema held in the multi_pool.stablecoins array of stablecoin mints.
// In remaining_accounts, user has to provide groups of accounts in the following format in the above order:
// [
// (stablecoin_mint, stablecoin_vault, stablecoin_user_ata),
// (stablecoin_mint, stablecoin_vault, stablecoin_user_ata)
// ...
// ]

pub fn add_liquidity(
    ctx: Context<AddLiquidity>,
    pool_id: u64,
    deposits: Vec<u64>,
) -> Result<()> {
    let multi_pool = &ctx.accounts.multi_pool;
    let lp_token = &ctx.accounts.lp_token;
    let groups = &ctx.remaining_accounts;
    let token_program = &ctx.accounts.token_program;
    let lp_token_user_ata = &ctx.accounts.lp_token_user_ata;

    // Force remaining_accounts schema.
    require!(
        groups.len() % 3 == 0,
        GeistError::InvalidRemainingAccountsSchema
    );

    // Force deposits array to be eq len as stablecoins array in the pool.
    // Force groups array to be eq len as stablecoins array in the pool.
    require!(
        groups.len() % 3 == multi_pool.stablecoins.len() && deposits.len() == multi_pool.stablecoins.len(),
        GeistError::InvalidInput
    );

    let groups_count = groups.len() % 3;

    let mut balances: Vec<u64> = Vec::new();
    for n in 0..groups_count {
        // Stablecoin mint
        let stablecoin_mint_account_info = &groups[n * 3];
        
        require!(
            multi_pool.stablecoins[n] == stablecoin_mint_account_info.key(),
            GeistError::InvalidRemainingAccountsSchema
        );

        let stablecoin_mint_data = stablecoin_mint_account_info.try_borrow_mut_data()?;
        let stablecoin_mint = Mint::try_deserialize(&mut stablecoin_mint_data.as_ref())?;

        // Stablecoin vault
        let stablecoin_vault_account_info = &groups[n * 3 + 1];
        let stablecoin_vault_data = stablecoin_vault_account_info.try_borrow_mut_data()?;
        let stablecoin_vault = TokenAccount::try_deserialize(&mut stablecoin_vault_data.as_ref())?;
        
        ctx.accounts.validate_stablecoin_vault(
            &stablecoin_vault, 
            stablecoin_vault_account_info.key,
            stablecoin_mint_account_info.key
        )?;

        require!(
            stablecoin_vault.mint == stablecoin_mint_account_info.key(),
            GeistError::InvalidRemainingAccountsSchema
        );

        // Stablecoin admin ata
        let stablecoin_user_ata_account_info = &groups[n * 3 + 2];
        let stablecoin_user_ata_data = stablecoin_user_ata_account_info.try_borrow_mut_data()?;
        let stablecoin_user_ata = TokenAccount::try_deserialize(&mut stablecoin_user_ata_data.as_ref())?;

        // If user deposits this token, transfer to LP.
        let deposit = deposits[n];

        // TODO: Only validate accounts if we use them for deposits?
        if (deposit > 0) {
            transfer(
                CpiContext::new(
                    token_program.clone().to_account_info(), 
                    Transfer {
                        authority: stablecoin_user_ata_account_info.clone(),
                        from: stablecoin_user_ata_account_info.clone(),
                        to: stablecoin_vault_account_info.clone()
                    }
                ),
                deposit
            )?;
        }
    }

    let lp_tokens = multi_pool.swap.compute_lp_tokens_on_deposit_multi(
        &deposits, 
        &balances, 
        lp_token.supply
    )?;

    let signer_seeds = &[
        BINARY_POOL_SEED.as_bytes(),
        &pool_id.to_le_bytes(),
        &[ctx.bumps.multi_pool]
    ];

    // Mint LP tokens to user ata.
    mint_to(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            MintTo {
                authority: multi_pool.to_account_info(),
                mint: lp_token.to_account_info(),
                to: lp_token_user_ata.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        lp_tokens
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    pool_id: u64
)]
pub struct AddLiquidity<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            BINARY_POOL_SEED.as_bytes(),
            &pool_id.to_le_bytes()
        ],
        bump,
        constraint = multi_pool.index == pool_id @ GeistError::PoolIdMismatch,
        constraint = !multi_pool.is_frozen @ GeistError::PoolFrozen
    )]
    pub multi_pool: Account<'info, MultiPool>,

    #[account(
        mut,
        address = multi_pool.lp_token,
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

impl AddLiquidity<'_> {
    pub fn validate_stablecoin_vault(
        &self,
        vault: &TokenAccount,
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
}