use anchor_lang::prelude::*;
use crate::states::*;
use crate::constants::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeCoreArgs {
    pub platform_fee_bps: u64
}

pub fn initialize_core(
    ctx: Context<InitializeCore>,
    args: InitializeCoreArgs
) -> Result<()> {
    let core = &mut ctx.accounts.core;
    let superadmin = &mut ctx.accounts.superadmin;

    let InitializeCoreArgs {
        platform_fee_bps
    } = args;

    core.next_pool_id = 0;
    core.supported_stablecoins = Vec::new();
    core.withdraw_only_stablecoins = Vec::new();

    core.update_fee(platform_fee_bps);
    core.set_new_superadmin(superadmin.key());
    core.unfreeze();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeCore<'info> {
    #[account(
        mut
    )]
    pub superadmin: Signer<'info>,

    #[account(
        init,
        payer = superadmin,
        seeds = [
            CORE_SEED.as_bytes()
        ],
        bump,
        space = Core::INITIAL_SIZE
    )]
    pub core: Account<'info, Core>,

    #[account()]
    pub system_program: Program<'info, System>,
}