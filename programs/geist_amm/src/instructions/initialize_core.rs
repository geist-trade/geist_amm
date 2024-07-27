use anchor_lang::prelude::*;
use crate::states::*;
use crate::constants::*;

pub fn initialize_core(
    ctx: Context<InitializeCore>,
    swap_fee_bps: u64,
    withdraw_fee_bps: u64,
) -> Result<()> {
    let core = &mut ctx.accounts.core;
    let superadmin = &mut ctx.accounts.superadmin;

    core.set_new_superadmin(superadmin.key());
    core.unfreeze();
    core.update_swap_fee(swap_fee_bps);
    core.update_withdrawal_fee(withdraw_fee_bps);

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