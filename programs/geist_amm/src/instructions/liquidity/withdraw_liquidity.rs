use anchor_lang::prelude::*;
use crate::math::rescale_to_decimals;
use crate::{liquidity::LiquidityManagament, math::rescale_to_max_precision};
use crate::errors::GeistError;
use anchor_spl::token::{
    self, burn, transfer, Burn, Mint, TokenAccount, Transfer
};
use crate::{constants::*, StableSwapMode};
use crate::stable_swap;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct WithdrawLiquidityArgs {
    pub pool_id: u64,
    // How much of the LP token user wants burn
    pub lp_token_burn: u64
}

pub fn withdraw_liquidity<'a>(
    ctx: Context<'_, '_, '_, 'a, LiquidityManagament<'a>>,
    args: WithdrawLiquidityArgs
) -> Result<()> {

    let WithdrawLiquidityArgs {
        lp_token_burn,
        pool_id
    } = args;

    let lp_token_user_ata = &ctx.accounts.lp_token_user_ata;
    let core = &ctx.accounts.core;
    let pool = &ctx.accounts.pool;
    let user = &ctx.accounts.user;
    let lp_token = &ctx.accounts.lp_token;
    let token_program = &ctx.accounts.token_program;
    let groups = &ctx.remaining_accounts;

    // Force remaining_accounts schema.
    require!(
        groups.len() % 3 == 0,
        GeistError::InvalidRemainingAccountsSchema
    );

    let groups_count = groups.len() / 3;

    // Force deposits array to be eq len as stablecoins array in the pool.
    // Force groups array to be eq len as stablecoins array in the pool.
    require!(
        groups_count == pool.stablecoins.len(),
        GeistError::InvalidInput
    );

    require!(
        lp_token_user_ata.amount >= lp_token_burn,
        GeistError::InsufficientBalanceForWithdrawal
    );

    let mut balances: Vec<u64> = Vec::new();
    let mut mints: Vec<Mint> = Vec::new();
    let mut sources: Vec<&AccountInfo> = Vec::new();
    let mut destinations: Vec<&AccountInfo> = Vec::new();

    for n in 0..groups_count {
        let stablecoin_mint_account_info = &groups[n * 3];

        // Require stablecoin support.
        require!(
            core.supported_stablecoins.contains(&stablecoin_mint_account_info.key()),
            GeistError::StablecoinNotSupported
        );

        // Require passing stablecoins in a specific schema.
        require!(
            pool.stablecoins[n] == stablecoin_mint_account_info.key(),
            GeistError::InvalidRemainingAccountsSchema
        );

        let mut decimals: u8 = 0;

        {
            let stablecoin_mint_data = stablecoin_mint_account_info.try_borrow_mut_data()?;
            let mint = Mint::try_deserialize(
                &mut stablecoin_mint_data.as_ref()
            )?;

            decimals = mint.decimals;
            mints.push(mint);
        }

        // Stablecoin vault
        let stablecoin_vault_account_info = &groups[n * 3 + 1];

        // Validate stablecoin vault address, type and balance.
        // New scope to drop RefMut at the end.
        {
            let stablecoin_vault_data = stablecoin_vault_account_info.try_borrow_mut_data()?;
            let stablecoin_vault = TokenAccount::try_deserialize(&mut stablecoin_vault_data.as_ref())?;
            
            ctx.accounts.validate_stablecoin_vault(
                &stablecoin_vault, 
                stablecoin_vault_account_info.key,
                stablecoin_mint_account_info.key
            )?;

            balances.push(
                rescale_to_max_precision(
                    stablecoin_vault.amount, 
                    decimals
                )
            );

            sources.push(stablecoin_vault_account_info);

            require!(
                stablecoin_vault.mint == stablecoin_mint_account_info.key(),
                GeistError::InvalidRemainingAccountsSchema
            );
        }

        let stablecoin_user_ata_account_info = &groups[n * 3 + 2];

        // Validate stablecoin user ATA
        {
            let stablecoin_user_ata_data = stablecoin_user_ata_account_info.try_borrow_mut_data()?;
            let stablecoin_user_ata = TokenAccount::try_deserialize(&mut stablecoin_user_ata_data.as_ref())?;
            
            ctx.accounts.validate_stablecoin_user_ata(
                &stablecoin_user_ata, 
                &stablecoin_user_ata_account_info.key, 
                &stablecoin_mint_account_info.key, 
                0
            )?;

            destinations.push(stablecoin_user_ata_account_info);
        }
    }

    let withdrawal_amounts = match &pool.swap.mode {
        StableSwapMode::CONSTANT => {
            pool.swap.compute_tokens_on_withdrawal(
                &balances,
                lp_token.supply,
                lp_token_burn
            )?
        },
        StableSwapMode::RATED(rates) => {
            pool.swap.compute_tokens_on_withdrawal_rated(
                &balances,
                rates,
                lp_token.supply,
                lp_token_burn
            )?
        }
    };

    for (index, amount) in withdrawal_amounts.iter().enumerate() {
        let source = sources[index];
        let destination = destinations[index];
        let mint = &mints[index];

        let signer_seeds = &[
            BINARY_POOL_SEED.as_bytes(),
            &args.pool_id.to_le_bytes(),
            &[pool.bump]
        ];

        transfer(
            CpiContext::new_with_signer(
                token_program.to_account_info(), 
                Transfer {
                    authority: pool.to_account_info(),
                    to: destination.to_account_info(),
                    from: source.to_account_info()
                }, 
                &[signer_seeds]
            ), 
            rescale_to_decimals(
                *amount, 
                mint.decimals
            )
        )?;
    }

    burn(
        CpiContext::new(
            token_program.to_account_info(), 
            Burn {
                mint: lp_token.to_account_info(),
                authority: user.to_account_info(),
                from: lp_token_user_ata.to_account_info()
            }
        ), 
        lp_token_burn
    )?;

    Ok(())
}