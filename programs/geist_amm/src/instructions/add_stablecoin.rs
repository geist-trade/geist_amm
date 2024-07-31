use anchor_lang::prelude::*;
use crate::errors::GeistError;
use crate::states::*;
use crate::constants::*;
use anchor_lang::system_program::{
    transfer,
    Transfer
};
use anchor_spl::token::Mint;

pub fn add_stablecoin(
    ctx: Context<AddStablecoin>
) -> Result<()> {
    let superadmin = &ctx.accounts.superadmin;

    let core = &mut ctx.accounts.core;
    let core_account_info = core.to_account_info();

    let stablecoin = &ctx.accounts.stablecoin;
    let withdraw_only = core.withdraw_only_stablecoins.contains(&stablecoin.key());

    let system_program = &ctx.accounts.system_program;

    if withdraw_only {
        // Only move from one vector to another, skip reallocation.
        core.reenable_stablecoin(stablecoin.key());
    } else {
        let current_rent = core_account_info.lamports();
        let new_account_len = core_account_info.data_len() + (32 as usize); // publickey of size 32

        let rent = Rent::get()?;
        let new_rent = rent.minimum_balance(new_account_len);

        transfer(
            CpiContext::new(
                system_program.to_account_info(), 
                Transfer {
                    to: core.to_account_info(),
                    from: superadmin.to_account_info()
                }
            ),
            new_rent - current_rent
        )?;

        core.to_account_info().realloc(
            new_account_len,
            false
        )?;

        core.add_stablecoin(stablecoin.key());
    }

    Ok(())
}

#[derive(Accounts)]
pub struct AddStablecoin<'info> {
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
        // Same stablecoin cannot be added twice.
        constraint = !core.supported_stablecoins.contains(&stablecoin.key()) 
    )]
    pub stablecoin: Account<'info, Mint>,

    #[account()]
    pub rent: Sysvar<'info, Rent>,

    #[account()]
    pub system_program: Program<'info, System>
}