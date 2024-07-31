pub mod instructions;
pub mod constants;
pub mod states;
pub mod errors;
pub mod math;

use anchor_lang::prelude::*;

use crate::instructions::*;
use crate::states::*;

// TODO: Simplify pool initialization, set all pools to be multi.
// Binary pool is just multi-pool with 2 stablecoins.
// TODO: Add validation on pool initialization & StableSwap methods
// TODO: add_liquidity, remove_liquidity, swap
// TODO:

declare_id!("AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n");

#[program]
pub mod geist {
    use super::*;

    pub fn initialize_core(
        ctx: Context<InitializeCore>,
        swap_fee_bps: u64,
        withdraw_fee_bps: u64
    ) -> Result<()> {
        instructions::initialize_core(
            ctx,
            swap_fee_bps,
            withdraw_fee_bps
        )
    }

    pub fn initialize_binary_pool(
        ctx: Context<InitializeBinaryPool>,
        amp: u64,
        initial_deposit_a: u64, 
        initial_deposit_b: u64, 
        fees: Fees
    ) -> Result<()> {
        instructions::initialize_binary_pool(
            ctx,
            amp,
            initial_deposit_a,
            initial_deposit_b,
            fees
        )
    }

    pub fn initialize_multi_pool<'a>(
        ctx: Context<'_, '_, '_, 'a, InitializeMultiPool<'a>>, 
        amp: u64,
        n_tokens: u64, 
        initial_deposits: Vec<u64>,
        fees: Fees
    ) -> Result<()> {
        instructions::initialize_multi_pool(
            ctx,
            amp,
            n_tokens,
            initial_deposits,
            fees
        )
    }

    pub fn add_liquidity<'a>(
        ctx: Context<'_, '_, '_, 'a, AddLiquidity<'a>>,
        pool_id: u64, 
        deposits: Vec<u64>
    ) -> Result<()> {
        instructions::add_liquidity(
            ctx, 
            pool_id, 
            deposits
        )
    }

    pub fn swap(
        ctx: Context<Swap>,
        pool_id: u64,
        amount: u64,
        minimum_received: u64,
        from_id: usize,
        to_id: usize
    ) -> Result<()> {
        instructions::swap(
            ctx,
            pool_id,
            amount,
            minimum_received,
            from_id,
            to_id
        )
    }
}

