pub mod instructions;
pub mod constants;
pub mod states;
pub mod errors;
pub mod math;

use anchor_lang::prelude::*;
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

    pub fn initialize_pool<'a>(
        ctx: Context<'_, '_, '_, 'a, InitializePool<'a>>, 
        args: InitializePoolArgs
    ) -> Result<()> {
        instructions::initialize_pool(
            ctx,
            args
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

    pub fn get_virtual_price(
        ctx: Context<GetVirtualPrice>,
        args: GetVirtualPriceArgs
    ) -> Result<u64> {
        instructions::get_virtual_price(
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

