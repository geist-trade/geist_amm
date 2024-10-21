use anchor_lang::prelude::*;
use anchor_spl::token::{
    Mint,
    Token,
    TokenAccount,
    transfer,
    Transfer
};
use crate::constants::*;
use crate::states::*;
use crate::errors::GeistError;
use anchor_spl::token::spl_token::state::AccountState;
use crate::Pool;
use crate::program;
use crate::borsh;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct ExactIn {
    pub minimum_received: u64,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct ExactOut {
    pub maximum_taken: u64,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub enum SwapMode {
    ExactIn(ExactIn),
    ExactOut(ExactOut)
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct SwapArgs {
    pub pool_id: u64,
    pub from_id: u8,
    pub to_id: u8,
    pub amount: u64,
    pub mode: SwapMode
}

pub fn swap(
    ctx: Context<Swap>,
    args: SwapArgs
) -> Result<()> {

    let SwapArgs {
        amount,
        mode,
        from_id,
        to_id,
        pool_id,
    } = args;

    let pool = &ctx.accounts.pool;
    let stablecoin_lps = ctx.remaining_accounts;
    let token_program = &ctx.accounts.token_program;

    let user = &ctx.accounts.user;
    let stablecoin_input_user_ata = &ctx.accounts.stablecoin_input_user_ata;
    let stablecoin_input_vault = &ctx.accounts.stablecoin_input_vault;

    let stablecoin_output_user_ata = &ctx.accounts.stablecoin_output_user_ata;
    let stablecoin_output_vault = &ctx.accounts.stablecoin_output_vault;

    // Require users to provide same amount of LP accounts as stablecoins specified in multi_pool.
    require!(
        stablecoin_lps.len() == pool.stablecoins.len(),
        GeistError::InvalidRemainingAccountsSchema
    );

    let mut balances: Vec<u64> = Vec::new();
    for n in 0..stablecoin_lps.len() {
        let stablecoin_mint = pool.stablecoins[n];
        let lp_account_info = &stablecoin_lps[n];
        let lp_data = lp_account_info.try_borrow_mut_data()?;
        let lp = TokenAccount::try_deserialize(&mut lp_data.as_ref())?;

        // Validate if the token account is correct.
        ctx.accounts.validate_lp(
            &lp,
            lp_account_info.key,
            &stablecoin_mint
        )?;

        balances.push(lp.amount);
    }

    let fee: u64;
    let in_amount: u64;
    let out_amount: u64;
    
    match mode {
        SwapMode::ExactIn(ExactIn { minimum_received }) => {
            fee = pool.fees.swap_fee_bps * amount / 10_000;
            in_amount = amount - fee;

            let SwapOut {
                out_amount: out
            } = pool.swap.swap_exact_in(
                &balances, 
                from_id.into(), 
                to_id.into(), 
                in_amount
            )?;

            out_amount = out;

            require!(
                out_amount >= minimum_received,
                GeistError::SlippageExceeded
            );
        }

        SwapMode::ExactOut(ExactOut { maximum_taken }) => {
            out_amount = amount;

            let SwapIn {
                in_amount: in_am
            } = pool.swap.swap_exact_out(
                &balances, 
                from_id.into(), 
                to_id.into(), 
                out_amount, 
            )?;

            msg!("in_am: {}", in_am);

            in_amount = in_am;
            fee = pool.fees.swap_fee_bps * in_am / 10_000;

            let total_taken = in_amount + fee;
            msg!("total taken: {}", total_taken);

            require!(
                total_taken <= maximum_taken,
                GeistError::SlippageExceeded
            );
        }
    }

    msg!("out amount: {}", out_amount);
    msg!("vault: {}", stablecoin_output_vault.amount);
    msg!("users ata: {}", stablecoin_output_user_ata.amount);

    require!(
        out_amount < stablecoin_output_vault.amount,
        GeistError::NotEnoughLiquidity
    );

    require!(
        in_amount <= stablecoin_output_user_ata.amount,
        GeistError::NotEnoughFunds
    );

    let signer_seeds = &[
        BINARY_POOL_SEED.as_bytes(),
        &pool.index.to_le_bytes(),
        &[ctx.bumps.pool]
    ];

    msg!("user input balance: {}", stablecoin_input_user_ata.amount);
    msg!("transaction input: {}", in_amount + fee);

    // Transfer input to LP.
    transfer(
        CpiContext::new(
            token_program.to_account_info(), 
            Transfer {
                authority: user.to_account_info(),
                from: stablecoin_input_user_ata.to_account_info(),
                to: stablecoin_input_vault.to_account_info()
            }
        ), 
        in_amount + fee
    )?;

    // Transfer output to user.
    transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            Transfer {
                authority: pool.to_account_info(),
                from: stablecoin_output_vault.to_account_info(),
                to: stablecoin_output_user_ata.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        out_amount
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    args: SwapArgs
)]
pub struct Swap<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            CORE_SEED.as_bytes()
        ],
        bump,
        constraint = !(core.is_frozen) @ GeistError::ProtocolFrozen
    )]
    pub core: Account<'info, Core>,

    #[account(
        mut,
        seeds = [
            BINARY_POOL_SEED.as_bytes(),
            &args.pool_id.to_le_bytes()
        ],
        bump,
        constraint = pool.index == args.pool_id @ GeistError::PoolIdMismatch,
        constraint = !pool.is_frozen @ GeistError::PoolFrozen
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        address = pool.stablecoins[args.from_id as usize],
        constraint = core.supported_stablecoins.contains(&stablecoin_input.key()) @ GeistError::StablecoinNotSupported,
    )]
    pub stablecoin_input: Account<'info, Mint>,

    #[account(
        mut,
        address = pool.stablecoins[args.to_id as usize]
    )]
    pub stablecoin_output: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            VAULT_SEED.as_bytes(),
            pool.key().as_ref(),
            stablecoin_input.key().as_ref()
        ],
        bump,
    )]
    pub stablecoin_input_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            VAULT_SEED.as_bytes(),
            pool.key().as_ref(),
            stablecoin_output.key().as_ref()
        ],
        bump
    )]
    pub stablecoin_output_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = stablecoin_input,
        associated_token::authority = user
    )]
    pub stablecoin_input_user_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = stablecoin_output,
        associated_token::authority = user,
        constraint = stablecoin_output_user_ata.state == AccountState::Initialized
    )]
    pub stablecoin_output_user_ata: Account<'info, TokenAccount>,

    #[account()]
    pub token_program: Program<'info, Token>
}

impl Swap<'_> {
    pub fn validate_stablecoin_mint(
        &self,
        mint: &Pubkey
    ) -> Result<()> {
        // Stablecoin must be supported by the protocol
        // to be added to a pool. Can't be in withdraw mode.
        require!(
            self.core.supported_stablecoins.contains(mint),
            GeistError::StablecoinNotSupported
        );

        require!(
            self.pool.stablecoins.contains(mint),
            GeistError::StablecoinNotSupported
        );

        Ok(())
    }

    pub fn validate_lp(
        &self,
        lp: &TokenAccount,
        lp_key: &Pubkey,
        stablecoin_mint: &Pubkey
    ) -> Result<()> {
        // Vault must be owned by the LP.
        require!(
            lp.owner == self.pool.key(),
            GeistError::InvalidTokenAccountOwner
        );

        require!(
            lp.mint == *stablecoin_mint,
            GeistError::InvalidTokenAccountMint
        );

        // Rederive from bare seeds and compare.
        let (rederived_vault, _) = Pubkey::find_program_address(
            &[
                VAULT_SEED.as_bytes(),
                self.pool.key().as_ref(),
                stablecoin_mint.key().as_ref()
            ], 
            &program::GeistAmm::id()
        );

        require!(
            rederived_vault.key() == *lp_key,
            GeistError::InvalidVault
        );

        Ok(())
    }
}