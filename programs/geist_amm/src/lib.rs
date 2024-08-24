pub mod instructions;
pub mod constants;
pub mod states;
pub mod errors;
pub mod math;

use anchor_lang::prelude::*;
use crate::errors::GeistError;
use crate::instructions::*;
use crate::states::*;

declare_id!("AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n");

#[program]
pub mod geist_amm {
    use super::*;

    pub fn initialize_core(
        ctx: Context<InitializeCore>,
        args: InitializeCoreArgs
    ) -> Result<()> {
        instructions::initialize_core(
            ctx,
            args
        )
    }

    pub fn add_stablecoin(
        ctx: Context<AddStablecoin>
    ) -> Result<()> {
        instructions::add_stablecoin(ctx)
    }

    pub fn disable_stablecoin(
        ctx: Context<DisableStablecoin>
    ) -> Result<()> {
        instructions::disable_stablecoin(ctx)
    }

    /// Deprecated.
    /// Use initialize_multi_pool with two assets instead.
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
        ctx: Context<'_, '_, '_, 'a, LiquidityManagament<'a>>,
        args: AddLiquidityArgs
    ) -> Result<()> {
        instructions::add_liquidity(
            ctx, 
            args
        )
    }
    
    pub fn withdraw_liquidity<'a>(
        ctx: Context<'_, '_, '_, 'a, LiquidityManagament<'a>>,
        args: WithdrawLiquidityArgs
    ) -> Result<()> {
        instructions::withdraw_liquidity(
            ctx,
            args
        )
    }

    pub fn swap(
        ctx: Context<Swap>,
        args: SwapArgs
    ) -> Result<()> {
        instructions::swap(
            ctx,
            args
        )
    }
}

