use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use crate::constants::*;
use crate::program::Geist;
use crate::states::*;
use crate::errors::GeistError;
use anchor_spl::token::spl_token::state::AccountState;
use crate::MultiPool;

pub fn swap(
    ctx: Context<Swap>,
    pool_id: u64,
    amount: u64,
    minimum_received: u64,
) -> Result<()> {
    let multi_pool = &ctx.accounts.multi_pool;

    let groups = ctx.remaining_accounts;
    let groups_count = groups.len() % 3;

    require!(
        groups_count == 0 && groups_count == multi_pool.stablecoins.len(),
        GeistError::InvalidRemainingAccountsSchema
    );

    let balances: Vec<u64> = Vec::new();
    for n in 0..groups_count {
        // Stablecoin mint
        let stablecoin_mint_account_info = &groups[n * 3];
        ctx.accounts.validate_stablecoin_mint(stablecoin_mint_account_info.key)?;
    }


    Ok(())
}

#[derive(Accounts)]
#[instruction(
    pool_id: u64,
    amount: u64,
    minimum_received: u64,
)]
pub struct Swap<'info> {
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
            &pool_id.to_le_bytes()
        ],
        bump,
        constraint = multi_pool.index == pool_id @ GeistError::PoolIdMismatch,
        constraint = !multi_pool.is_frozen @ GeistError::PoolFrozen
    )]
    pub multi_pool: Account<'info, MultiPool>,

    #[account(
        mut,
        constraint = multi_pool.stablecoins.contains(&stablecoin_input.key()) @ GeistError::StablecoinNotSupported,
        constraint = core.supported_stablecoins.contains(&stablecoin_input.key()) @ GeistError::StablecoinNotSupported
    )]
    pub stablecoin_input: Account<'info, Mint>,

    #[account(
        mut,
        constraint = multi_pool.stablecoins.contains(&stablecoin_output.key())
    )]
    pub stablecoin_output: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            VAULT_SEED.as_bytes(),
            multi_pool.key().as_ref(),
            stablecoin_input.key().as_ref()
        ],
        bump,
    )]
    pub stablecoin_input_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            VAULT_SEED.as_bytes(),
            multi_pool.key().as_ref(),
            stablecoin_output.key().as_ref()
        ],
        bump,
        constraint = stablecoin_output_vault.amount > minimum_received @ GeistError::NotEnoughLiquidity
    )]
    pub stablecoin_output_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = stablecoin_input,
        associated_token::authority = user,
        constraint = stablecoin_input_user_ata.amount > amount @ GeistError::NotEnoughFunds,
        constraint = core
    )]
    pub stablecoin_input_user_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = stablecoin_output,
        associated_token::authority = user,
        constraint = stablecoin_output_user_ata.state == AccountState::Initialized
    )]
    pub stablecoin_output_user_ata: Account<'info, TokenAccount>,

    #[account()]
    pub token_program: Program<'info, Token>
}

impl Swap<'_> {
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
            self.multi_pool.stablecoins.contains(mint),
            GeistError::StablecoinNotSupported
        );

        Ok(())
    }
}