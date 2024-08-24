use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GeistError;
use crate::constants::*;
use anchor_spl::token::Mint;

pub fn disable_stablecoin(
    ctx: Context<DisableStablecoin>
) -> Result<()> {
    let core = &mut ctx.accounts.core;
    let stablecoin = &ctx.accounts.stablecoin;

    core.disable_stablecoin(stablecoin.key());

    Ok(())
}

#[derive(Accounts)]
pub struct DisableStablecoin<'info> {
    #[account(
        mut,
        address = core.superadmin
    )]
    pub superadmin: Signer<'info>,

    #[account(
        mut,
        seeds = [
            CORE_SEED.as_bytes()
        ],
        bump,
        constraint = !core.is_frozen @ GeistError::ProtocolFrozen,
        has_one = superadmin @ GeistError::SuperadminMismatch
    )]
    pub core: Account<'info, Core>,

    #[account(
        mut,
        // Only disable currently enabled stablecoin.
        constraint = core.supported_stablecoins.contains(&stablecoin.key()) @ GeistError::StablecoinNotSupported
    )]
    pub stablecoin: Account<'info, Mint>,
}