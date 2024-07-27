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
    initial_deposit_a: u64,
    initial_deposit_b: u64,
) -> Result<()> {
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