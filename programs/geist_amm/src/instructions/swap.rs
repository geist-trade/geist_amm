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
use crate::MultiPool;
use crate::program;

pub fn swap(
    ctx: Context<Swap>,
    pool_id: u64,
    amount: u64,
    minimum_received: u64,
    from_id: usize, // Indexes in the multi_pool.stablecoins vector.
    to_id: usize
) -> Result<()> {
    let multi_pool = &ctx.accounts.multi_pool;
    let stablecoin_lps = ctx.remaining_accounts;
    let token_program = &ctx.accounts.token_program;

    let user = &ctx.accounts.user;
    let stablecoin_input_user_ata = &ctx.accounts.stablecoin_input_user_ata;
    let stablecoin_input_vault = &ctx.accounts.stablecoin_input_vault;

    let stablecoin_output_user_ata = &ctx.accounts.stablecoin_output_user_ata;
    let stablecoin_output_vault = &ctx.accounts.stablecoin_output_vault;

    // Require users to provide same amount of LP accounts as stablecoins specified in multi_pool.
    require!(
        stablecoin_lps.len() == multi_pool.stablecoins.len(),
        GeistError::InvalidRemainingAccountsSchema
    );

    let mut balances: Vec<u64> = Vec::new();

    for n in 0..stablecoin_lps.len() {
        let stablecoin_mint = multi_pool.stablecoins[n];
        let lp_account_info = &stablecoin_lps[n];
        let lp_data = lp_account_info.try_borrow_mut_data()?;
        let lp = TokenAccount::try_deserialize(&mut lp_data.as_ref())?;

        // Validate if the token account is correct.
        ctx.accounts.validate_lp(
            &lp,
            lp_account_info.key,
            &stablecoin_mint
        )?;

        balances[n] = lp.amount;
    }

    let SwapOut {
        out_amount,
        fee
    } = multi_pool.swap.swap_exact_in(
        &balances, 
        from_id, 
        to_id, 
        amount
    )?;

    require!(
        out_amount >= minimum_received,
        GeistError::SlippageExceeded
    );



    let signer_seeds = &[
        BINARY_POOL_SEED.as_bytes(),
        &multi_pool.index.to_le_bytes(),
        &[ctx.bumps.multi_pool]
    ];

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
        amount
    )?;

    // Transfer output to user.
    transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            Transfer {
                authority: multi_pool.to_account_info(),
                from: stablecoin_output_vault.to_account_info(),
                to: stablecoin_output_user_ata.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        amount
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    pool_id: u64,
    amount: u64,
    minimum_received: u64,
    from_id: usize,
    to_id: usize
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
            &pool_id.to_le_bytes()
        ],
        bump,
        constraint = multi_pool.index == pool_id @ GeistError::PoolIdMismatch,
        constraint = !multi_pool.is_frozen @ GeistError::PoolFrozen
    )]
    pub multi_pool: Account<'info, MultiPool>,

    #[account(
        mut,
        constraint = multi_pool.stablecoins.contains(&stablecoin_input.key()) @ GeistError::StablecoinNotSupported,
        constraint = core.supported_stablecoins.contains(&stablecoin_input.key()) @ GeistError::StablecoinNotSupported,
        constraint = multi_pool.stablecoins[from_id] == stablecoin_input.key()
    )]
    pub stablecoin_input: Account<'info, Mint>,

    #[account(
        mut,
        constraint = multi_pool.stablecoins.contains(&stablecoin_output.key()),
        constraint = multi_pool.stablecoins[to_id] == stablecoin_output.key()
    )]
    pub stablecoin_output: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            VAULT_SEED.as_bytes(),
            multi_pool.key().as_ref(),
            stablecoin_input.key().as_ref()
        ],
        bump,
    )]
    pub stablecoin_input_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            VAULT_SEED.as_bytes(),
            multi_pool.key().as_ref(),
            stablecoin_output.key().as_ref()
        ],
        bump,
        constraint = stablecoin_output_vault.amount > minimum_received @ GeistError::NotEnoughLiquidity
    )]
    pub stablecoin_output_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = stablecoin_input,
        associated_token::authority = user,
        constraint = stablecoin_input_user_ata.amount > amount @ GeistError::NotEnoughFunds,
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
            self.multi_pool.stablecoins.contains(mint),
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
            lp.owner == self.multi_pool.key(),
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
                self.multi_pool.key().as_ref(),
                stablecoin_mint.key().as_ref()
            ], 
            &program::Geist::id()
        );

        require!(
            rederived_vault.key() == *lp_key,
            GeistError::InvalidVault
        );

        Ok(())
    }
}