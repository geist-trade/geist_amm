use anchor_lang::prelude::*;
use anchor_spl::token;
use crate::constants::*;
use crate::states::*;
use crate::errors::errors::*;
use anchor_spl::associated_token::get_associated_token_address;
use crate::program;
use anchor_spl::token::{
    Mint,
    TokenAccount,
    MintTo,
    mint_to,
    Token,
    Transfer,
    transfer,
    spl_token::state::AccountState,
};
use crate::liquidity::*;

// Similarly to initialize_multi_pool, add_liquidity accepts array of deposits.
// The array has to match the schema held in the multi_pool.stablecoins array of stablecoin mints.
// In remaining_accounts, user has to provide groups of accounts in the following format in the above order:
// [
// (stablecoin_mint, stablecoin_vault, stablecoin_user_ata),
// (stablecoin_mint, stablecoin_vault, stablecoin_user_ata)
// ...
// ]

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct AddLiquidityArgs {
    pub pool_id: u64,
    pub deposits: Vec<u64>
}

pub fn add_liquidity<'a>(
    ctx: Context<'_, '_, '_, 'a, LiquidityManagament<'a>>,
    args: AddLiquidityArgs
) -> Result<()> {
    let user = &ctx.accounts.user;
    let core = &ctx.accounts.core;
    let pool = &ctx.accounts.pool;
    let lp_token = &ctx.accounts.lp_token;

    let groups = &ctx.remaining_accounts;
    let token_program = &ctx.accounts.token_program;
    let lp_token_user_ata = &ctx.accounts.lp_token_user_ata;

    let AddLiquidityArgs {
        deposits,
        pool_id
    } = args;

    // Force remaining_accounts schema.
    require!(
        groups.len() % 3 == 0,
        GeistError::InvalidRemainingAccountsSchema
    );

    let groups_count = groups.len() / 3;

    // Force deposits array to be eq len as stablecoins array in the pool.
    // Force groups array to be eq len as stablecoins array in the pool.
    require!(
        groups_count == pool.stablecoins.len() && 
        deposits.len() == pool.stablecoins.len(),
        GeistError::InvalidInput
    );

    let mut balances: Vec<u64> = Vec::new();
    for n in 0..groups_count {
        let stablecoin_mint_account_info = &groups[n * 3];

        // Require stablecoin support.
        require!(
            core.supported_stablecoins.contains(&stablecoin_mint_account_info.key()),
            GeistError::StablecoinNotSupported
        );
        
        // You can only add liquidity if stablecoin is in deposit mode.
        require!(
            !core.withdraw_only_stablecoins.contains(&stablecoin_mint_account_info.key()),
            GeistError::StablecoinWithdrawOnly
        );

        // Require passing stablecoins in a specific schema.
        require!(
            pool.stablecoins[n] == stablecoin_mint_account_info.key(),
            GeistError::InvalidRemainingAccountsSchema
        );

        // Validate stablecoin account type. New scope to drop RefMut at the end.
        {
            let stablecoin_mint_data = stablecoin_mint_account_info.try_borrow_mut_data()?;
            Mint::try_deserialize(
                &mut stablecoin_mint_data.as_ref()
            )?;
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

            balances.push(stablecoin_vault.amount);

            require!(
                stablecoin_vault.mint == stablecoin_mint_account_info.key(),
                GeistError::InvalidRemainingAccountsSchema
            );
        }

        // If user deposits this token, transfer to LP.
        let deposit = deposits[n];

        // Stablecoin admin ata
        let stablecoin_user_ata_account_info = &groups[n * 3 + 2];

        // Validate stablecoin user ATA
        {
            let stablecoin_user_ata_data = stablecoin_user_ata_account_info.try_borrow_mut_data()?;
            let stablecoin_user_ata = TokenAccount::try_deserialize(&mut stablecoin_user_ata_data.as_ref())?;
            
            ctx.accounts.validate_stablecoin_user_ata(
                &stablecoin_user_ata, 
                &stablecoin_user_ata_account_info.key, 
                &stablecoin_mint_account_info.key, 
                deposit
            )?;
        }

        // TODO: Only validate accounts if we use them for deposits?
        if deposit > 0 {
            transfer(
                CpiContext::new(
                    token_program.to_account_info(), 
                    Transfer {
                        authority: user.to_account_info(),
                        from: stablecoin_user_ata_account_info.clone(),
                        to: stablecoin_vault_account_info.clone()
                    }
                ),
                deposit
            )?;

        }
    }

    msg!("Tokens transferred. Calculating LP tokens");

    let lp_tokens = match &pool.swap.mode {
        StableSwapMode::CONSTANT => {
            pool
                .swap
                .compute_lp_tokens_on_deposit_multi(
                    &deposits, 
                    &balances, 
                    lp_token.supply
                )?
        },
        StableSwapMode::RATED(rates) => {
            pool
                .swap
                .compute_lp_tokens_on_deposit_multi_rated(
                    &deposits, 
                    &balances, 
                    rates,
                    lp_token.supply
                )?
        }
    };

    msg!("Minting LP tokens: {}", lp_tokens);

    pool.mint_lp_tokens(
        lp_tokens, 
        token_program.to_account_info(), 
        lp_token.to_account_info(), 
        lp_token_user_ata.to_account_info(), 
        pool.to_account_info()
    )?;

    Ok(())
}