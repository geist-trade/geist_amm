use anchor_lang::prelude::*;
use anchor_lang::solana_program::address_lookup_table::instruction;
use anchor_spl::token::{
    Mint,
    TokenAccount,
    Token
};
use crate::constants::*;
use crate::errors::GeistError;
use crate::states::*;

pub fn initialize_binary_pool(
    ctx: Context<InitializeBinaryPool>,
    amp: u64,
    initial_deposit_a: u64,
    initial_deposit_b: u64,
    fees: Fees
) -> Result<()> {
    let admin = &ctx.accounts.admin;
    let core = &ctx.accounts.core;
    let binary_pool = &mut ctx.accounts.binary_pool;
    
    let lp_token = &ctx.accounts.lp_token;

    let stablecoin_a = &ctx.accounts.stablecoin_a;
    let stablecoin_a_vault = &ctx.accounts.stablecoin_a_vault;

    let stablecoin_b = &ctx.accounts.stablecoin_b;
    let stablecoin_b_vault = &ctx.accounts.stablecoin_b_vault;

    binary_pool.index = core.next_pool_id;
    binary_pool.admin = admin.key();
    binary_pool.stablecoin_a = stablecoin_a.key();
    binary_pool.stablecoin_b = stablecoin_b.key();
    binary_pool.is_frozen = false;
    binary_pool.lp_token = lp_token.key();
    binary_pool.fees = fees;
    
    // We can either re-create this StableSwap on every function that needs it,
    // or we can store it's data permanently in the account, and only utilize implementation
    // for calculations.
    let stable_swap = StableSwap::new_binary(amp)?;
    binary_pool.swap = stable_swap;

    // Since this pool is binary, initialize 2 balances equal zero.
    let mut balances: Vec<u64> = vec![
        stablecoin_a_vault.amount,
        stablecoin_b_vault.amount
    ];

    // Calculate LP tokens coming from the initial A token deposit.
    let lp_tokens_a = binary_pool.swap.compute_lp_tokens_on_deposit(
        0,
        initial_deposit_a,
        &balances,
        lp_token.supply
    )?;
    
    balances[0] += initial_deposit_a;

    let lp_tokens_b = binary_pool.swap.compute_lp_tokens_on_deposit(
        1,
        initial_deposit_b,
        &balances,
        lp_token.supply
    )?;

    let lp_tokens_sum = lp_tokens_a + lp_tokens_b;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    initial_deposit_a: u64,
    initial_deposit_b: u64,
)]
pub struct InitializeBinaryPool<'info> {
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
        space = BinaryPool::INITIAL_SIZE,
        bump,
    )]
    pub binary_pool: Account<'info, BinaryPool>,

    #[account(
        mut,
        constraint = core.supported_stablecoins.contains(&stablecoin_a.key()) @ GeistError::StablecoinNotSupported
    )]
    pub stablecoin_a: Account<'info, Mint>,

    #[account(
        mut,
        constraint = core.supported_stablecoins.contains(&stablecoin_a.key()) @ GeistError::StablecoinNotSupported,
        constraint = stablecoin_b.key() != stablecoin_a.key() @ GeistError::DuplicatedMints
    )]
    pub stablecoin_b: Account<'info, Mint>,

    #[account(
        mut,
        constraint = lp_token.supply == 0 @ GeistError::LpTokenPreMinted,
        constraint = lp_token.mint_authority == binary_pool.key() @ GeistError::InvalidMintAuthority,
        constraint = lp_token.freeze_authority.is_none() @ GeistError::InvalidFreezeAuthority,
        constraint = lp_token.is_initialized @ GeistError::LpTokenNotInitialized
    )]
    pub lp_token: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        seeds = [
            VAULT_SEED.as_bytes(),
            binary_pool.key().as_ref(),
            stablecoin_a.key().as_ref()
        ],
        bump,
        token::mint = stablecoin_a,
        token::authority = binary_pool,
    )]
    pub stablecoin_a_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        seeds = [
            VAULT_SEED.as_bytes(),
            binary_pool.key().as_ref(),
            stablecoin_b.key().as_ref()
        ],
        bump,
        token::mint = stablecoin_b,
        token::authority = binary_pool,
    )]
    pub stablecoin_b_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = stablecoin_a,
        associated_token::authority = admin,
        constraint = stablecoin_a_admin_ata.amount >= initial_deposit_a @ GeistError::NotEnoughTokens
    )]
    pub stablecoin_a_admin_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = stablecoin_a,
        associated_token::authority = admin,
        constraint = stablecoin_b_admin_ata.amount >= initial_deposit_b @ GeistError::NotEnoughTokens
    )]
    pub stablecoin_b_admin_ata: Account<'info, TokenAccount>,

    #[account()]
    pub system_program: Program<'info, System>,

    #[account()]
    pub token_program: Program<'info, Token>,
}