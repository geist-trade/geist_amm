use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer
};
use anchor_spl::token_2022::spl_token_2022::solana_zk_token_sdk::instruction::transfer;
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
    let lp_token_user_ata = &ctx.accounts.lp_token_user_ata;

    let stablecoin_a = &ctx.accounts.stablecoin_a;
    let stablecoin_a_vault = &ctx.accounts.stablecoin_a_vault;
    let stablecoin_a_admin_ata = &ctx.accounts.stablecoin_a_admin_ata;

    let stablecoin_b = &ctx.accounts.stablecoin_b;
    let stablecoin_b_vault = &ctx.accounts.stablecoin_b_vault;
    let stablecoin_b_admin_ata = &ctx.accounts.stablecoin_b_admin_ata;

    let token_program = &ctx.accounts.token_program;

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

    let deposits: Vec<u64> = vec![
        initial_deposit_a,
        initial_deposit_b
    ];

    let lp_tokens = binary_pool
        .swap
        .compute_lp_tokens_on_deposit_multi(
            &deposits, 
            &balances, 
            lp_token.supply
        )?;

    let signer_seeds = &[
        BINARY_POOL_SEED.as_bytes(),
        &core.next_pool_id.to_le_bytes(),
        &[ctx.bumps.binary_pool]
    ];

    // Mint LP Tokens
    mint_to(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            MintTo {
                authority: binary_pool.to_account_info(),
                mint: lp_token.to_account_info(),
                to: lp_token_user_ata.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        lp_tokens
    )?;

    // Transfer stablecoin_a to the liquidity pool
    transfer(
        CpiContext::new(
            token_program.to_account_info(), 
            Transfer {
                from: stablecoin_a_admin_ata.to_account_info(),
                to: stablecoin_a_vault.to_account_info(),
                authority: admin.to_account_info()
            }
        ),
        initial_deposit_a
    )?;

    // Transfer stablecoin_a to the liquidity pool
    transfer(
        CpiContext::new(
            token_program.to_account_info(), 
            Transfer {
                from: stablecoin_b_admin_ata.to_account_info(),
                to: stablecoin_b_vault.to_account_info(),
                authority: admin.to_account_info()
            }
        ),
        initial_deposit_b
    )?;

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
        space = BinaryPool::INITIAL_SIZE as usize,
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
        constraint = lp_token.mint_authority == Some(binary_pool.key()).into() @ GeistError::InvalidMintAuthority,
        constraint = lp_token.freeze_authority.is_none() @ GeistError::InvalidFreezeAuthority,
        constraint = lp_token.is_initialized @ GeistError::LpTokenNotInitialized
    )]
    pub lp_token: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = lp_token,
        associated_token::authority = admin,
    )]
    pub lp_token_user_ata: Account<'info, TokenAccount>,

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