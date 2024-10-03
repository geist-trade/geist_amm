use anchor_lang::prelude::*;
use anchor_spl::token::{
    Mint,
    TokenAccount
};
use crate::states::Pool;
use crate::constants::*;
use crate::errors::GeistError;
use crate::program::GeistAmm;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetVirtualPriceArgs {
   pub pool_id: u64
}

pub fn get_virtual_price(
    ctx: Context<GetVirtualPrice>,
    args: GetVirtualPriceArgs
) -> Result<u64> {
    let pool = &ctx.accounts.pool;
    let lp_vaults = ctx.remaining_accounts;

    let lp_token = &ctx.accounts.lp_token;
    let lp_token_supply = lp_token.supply;

    require!(
        lp_vaults.len() == pool.stablecoins.len(),
        GeistError::InvalidInput
    );

    let mut balances: Vec<u64> = Vec::new();
    for (vault, stablecoin) in lp_vaults.iter().zip(pool.stablecoins.iter()) {
        let (rederived_vault, bump) = Pubkey::find_program_address(
            &[
                VAULT_SEED.as_bytes(),
                pool.key().as_ref(),
                stablecoin.as_ref()
            ], 
            &GeistAmm::id()
        );

        require!(
            rederived_vault.eq(vault.key),
            GeistError::InvalidInput
        );

        let stablecoin_vault_data = vault.try_borrow_mut_data()?;
        let deserialized_vault = TokenAccount::try_deserialize(
            &mut stablecoin_vault_data.as_ref()
        )?;

        balances.push(deserialized_vault.amount);
    }

    let virtual_price = pool.swap.get_virtual_price(
        &balances, 
        lp_token_supply
    )?;

    Ok(virtual_price)
}

#[derive(Accounts)]
#[instruction(
    args: GetVirtualPriceArgs
)]
pub struct GetVirtualPrice<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            BINARY_POOL_SEED.as_bytes(),
            &args.pool_id.to_le_bytes()
        ],
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        address = pool.lp_token
    )]
    pub lp_token: Account<'info, Mint>,
}