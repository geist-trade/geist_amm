use anchor_lang::prelude::*;
use anchor_spl::token::{
    Token,
    Mint,
    TokenAccount,
    spl_token::state::AccountState,
    Transfer,
    transfer,
    MintTo,
    mint_to,
    initialize_account3,
    InitializeAccount3,
};
use anchor_spl::associated_token::get_associated_token_address;
use anchor_lang::system_program::{
    create_account,
    CreateAccount
};
// use light_sdk::{
//     CPI_AUTHORITY_PDA_SEED, PROGRAM_ID_ACCOUNT_COMPRESSION, PROGRAM_ID_LIGHT_SYSTEM, PROGRAM_ID_LIGHT_TOKEN
// };
use crate::constants::*;
use crate::program;
use crate::states::*;
use crate::errors::GeistError;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct InitializePoolArgs {
    pub amp: u64,
    pub n_tokens: u64,
    pub deposits: Vec<u64>,
    pub fees: Fees
}

pub fn initialize_pool<'a>(
    ctx: Context<'_, '_, '_, 'a, InitializePool<'a>>,
    args: InitializePoolArgs
) -> Result<()> {
    let InitializePoolArgs {
        amp,
        deposits,
        fees,
        n_tokens
    } = args;

    let admin = &ctx.accounts.admin;
    let lp_token = &ctx.accounts.lp_token;
    let core = &ctx.accounts.core;
    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let lp_token_admin_ata = &ctx.accounts.lp_token_admin_ata;
    let pool = &ctx.accounts.pool;
    // let light_lp_token_pool = &ctx.accounts.light_lp_token_pool;
    // let light_cpi_authority = &ctx.accounts.light_cpi_authority;
    // let merkle_tree = &ctx.accounts.merkle_tree;
    // let light_system_program = &ctx.accounts.light_system_program;
    // let light_registered_program = &ctx.accounts.light_registered_program;
    // let noop_program = &ctx.accounts.noop_program;
    // let self_program = &ctx.accounts.self_program;
    // let account_compression_program = &ctx.accounts.account_compression_program;
    // let account_compression_authority = &ctx.accounts.account_compression_authority;
    // let compressed_token_program = &ctx.accounts.compressed_token_program;

    for deposit in &deposits {
        require!(
            *deposit > 0,
            GeistError::ZeroInitialDeposit
        );
    }

    // Remaining accounts have to be provided in the following schema:
    // (stablecoin, stablecoin_vault, stablecoin_admin_ata)
    // If user is not depositing some stablecoin at the moment of pool initialization
    // their ATA doesn't have to be initialized - needs to be provided though for the program 
    // simplicity.

    let groups = ctx.remaining_accounts;
    require!(
        groups.len() % 3 == 0,
        GeistError::InvalidRemainingAccountsSchema
    );

    // Only support initialization of pools with up to 8 tokens
    require!(
        n_tokens <= 8,
        GeistError::InvalidInput
    );

    let groups_count = (groups.len() / 3) as usize;

    // Require user to provide correct number 
    // of account groups and correct length of deposit array.
    // No deposit == zeros.
    require!(
        groups_count == (n_tokens as usize) && 
        deposits.len() == (n_tokens as usize),
        GeistError::InvalidInput
    );

    let signer_seeds = &[
        BINARY_POOL_SEED.as_bytes(),
        &core.next_pool_id.to_le_bytes(),
        &[ctx.bumps.pool]
    ];


    // TODO: Make this deserialization + validation process more generalised.

    let mut stablecoins: Vec<Pubkey> = Vec::new();
    let mut balances: Vec<u64> = Vec::new();
    for n in 0..groups_count {
        // Validate stablecoin mint
        let stablecoin_mint_account_info = &groups[n * 3];
        ctx.accounts.validate_stablecoin_mint(stablecoin_mint_account_info.key)?;
        stablecoins.push(stablecoin_mint_account_info.key());

        // Validate stablecoin data, make sure it's Mint account
        // Initialize new scope so RefMut is dropped, we'll need to re-borrow it later
        {
            let stablecoin_mint_data = stablecoin_mint_account_info.try_borrow_mut_data()?;
            Mint::try_deserialize(
                &mut stablecoin_mint_data.as_ref()
            )?;
        }

        // Stablecoin vault + PDA validation
        let stablecoin_vault_account_info = &groups[n * 3 + 1];
        let vault_bump = ctx.accounts.validate_stablecoin_vault_and_rederive_bump(
            &stablecoin_vault_account_info.key,
            stablecoin_mint_account_info.key
        )?;

        let rent = Rent::get()?;
        let lamports = rent.minimum_balance(165);

        let signer_seeds = &[
            VAULT_SEED.as_bytes(),
            &pool.key().to_bytes(),
            &stablecoin_mint_account_info.key.to_bytes(),
            &[vault_bump]
        ];

        // Create stablecoin vault
        create_account(
            CpiContext::new_with_signer(
                system_program.to_account_info(), 
                CreateAccount {
                    from: admin.to_account_info(),
                    to: stablecoin_vault_account_info.clone()
                },
                &[signer_seeds]
            ),
            lamports,
            165,
            &token_program.key()
        )?;

        // Initialize stablecoin vault token account
        initialize_account3(
            CpiContext::new_with_signer(
                token_program.to_account_info(), 
                InitializeAccount3 {
                    account: stablecoin_vault_account_info.clone(),
                    mint: stablecoin_mint_account_info.clone(),
                    authority: pool.to_account_info()
                },
                &[signer_seeds]
            )
        )?;

        // Initialize new scope to drop RefMut at the end. Push balances to array.
        {
            let stablecoin_vault_data = stablecoin_vault_account_info.try_borrow_mut_data()?;
            let stablecoin_vault = TokenAccount::try_deserialize(
                &mut stablecoin_vault_data.as_ref()
            )?;
            balances.push(stablecoin_vault.amount);
        }

        // Stablecoin admin ata
        let stablecoin_admin_ata_account_info = &groups[n * 3 + 2];

        // New scope to validate the account. Drop RefMut at the end, cause we need to re-borrow it in next CPI.
        {
            let stablecoin_admin_ata_data = stablecoin_admin_ata_account_info.try_borrow_mut_data()?;
            let stablecoin_admin_ata = TokenAccount::try_deserialize(&mut stablecoin_admin_ata_data.as_ref())?;

            ctx.accounts.validate_stablecoin_admin_ata(
                &stablecoin_admin_ata,
                stablecoin_admin_ata_account_info.key,
                stablecoin_mint_account_info.key,
                deposits[n]
            )?;
        }

        // If user deposits this token, transfer to LP.
        let deposit = deposits[n];

        // TODO: Only validate accounts if we use them for deposits?
        if deposit > 0 {
            transfer(
                CpiContext::new(
                    token_program.to_account_info(), 
                    Transfer {
                        authority: admin.to_account_info(),
                        from: stablecoin_admin_ata_account_info.clone(),
                        to: stablecoin_vault_account_info.clone()
                    }
                ),
                deposit
            )?;
        }
    }

    let stable_swap = StableSwap::new(amp, n_tokens)?;
    let pool = &mut ctx.accounts.pool;

    pool.admin = admin.key();
    pool.swap = stable_swap;
    pool.fees = fees;
    pool.is_frozen = false;
    pool.lp_token = lp_token.key();
    pool.stablecoins = stablecoins;
    pool.index = core.next_pool_id;
    pool.bump = ctx.bumps.pool;
    pool.token_mode = TokenMode::SPL;

    let lp_tokens = pool
        .swap
        .compute_lp_tokens_on_deposit_multi(
            &deposits, 
            &balances, 
            lp_token.supply
        )?;

    // pool.initialize_compressed_lp_token_pool(
    //     admin, 
    //     &lp_token.to_account_info(), 
    //     &light_lp_token_pool.to_account_info(), 
    //     system_program, 
    //     token_program, 
    //     light_cpi_authority,
    //     compressed_token_program
    // )?;

    // pool.mint_compressed_lp_tokens(
    //     admin, 
    //     &pool.to_account_info(), 
    //     &lp_token.to_account_info(), 
    //     merkle_tree, 
    //     &lp_token_admin_ata.to_account_info(), 
    //     light_cpi_authority,
    //     token_program,
    //     compressed_token_program,
    //     light_system_program,
    //     light_registered_program,
    //     noop_program,
    //     account_compression_authority,
    //     account_compression_program,
    //     self_program,
    //     system_program,
    //     &light_lp_token_pool.to_account_info(),
    //     lp_tokens
    // )?;

    mint_to(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            MintTo {
                authority: pool.to_account_info(),
                mint: lp_token.to_account_info(),
                to: lp_token_admin_ata.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        lp_tokens
    )?;

    let core = &mut ctx.accounts.core;
    core.next_pool_id += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    args: InitializePoolArgs
)]
pub struct InitializePool<'info> {
    #[account(
        mut
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [
            CORE_SEED.as_bytes()
        ],
        bump,
        constraint = !core.is_frozen
    )]
    pub core: Account<'info, Core>,

    #[account(
        init,
        payer = admin,
        seeds = [
            BINARY_POOL_SEED.as_bytes(),
            &core.next_pool_id.to_le_bytes()
        ],
        space = Pool::INITIAL_SIZE as usize + ((args.n_tokens * 32) as usize),
        bump,
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        constraint = lp_token.supply == 0 @ GeistError::LpTokenPreMinted,
        constraint = lp_token.mint_authority == Some(pool.key()).into() @ GeistError::InvalidMintAuthority,
        constraint = lp_token.freeze_authority.is_none() @ GeistError::InvalidFreezeAuthority,
        constraint = lp_token.is_initialized @ GeistError::LpTokenNotInitialized,
        constraint = lp_token.decimals == 6 @ GeistError::InvalidLpTokenDecimals
    )]
    pub lp_token: Account<'info, Mint>,

    // #[account(
    //     constraint = light_lp_token_pool.key() == light_compressed_token::get_token_pool_pda(&lp_token.key())
    // )]
    // pub light_lp_token_pool: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = lp_token,
        associated_token::authority = admin,
    )]
    pub lp_token_admin_ata: Account<'info, TokenAccount>,

    #[account()]
    pub rent: Sysvar<'info, Rent>,

    #[account()]
    pub token_program: Program<'info, Token>,

    #[account()]
    pub system_program: Program<'info, System>,

    // /// CHECK: Not reading or writing to this account, fallback to Light Protocol security
    // #[account()]
    // pub merkle_tree: AccountInfo<'info>,

    // /// CHECK: not writing, nor reading from this account
    // #[account()]
    // pub noop_program: AccountInfo<'info>,

    // /// CHECK: directly checking program id
    // #[account(
    //     address = light_sdk::PROGRAM_ID_LIGHT_SYSTEM
    // )]
    // pub light_system_program: AccountInfo<'info>,

    // /// CHECK: directly checking program id
    // #[account(
    //     address = PROGRAM_ID_ACCOUNT_COMPRESSION
    // )]
    // pub account_compression_program: AccountInfo<'info>,

    // /// CHECK: directly checking program id
    // #[account(
    //     address = PROGRAM_ID_LIGHT_TOKEN
    // )]
    // pub compressed_token_program: AccountInfo<'info>,

    // /// CHECK: directly checking seeds
    // #[account(
    //     seeds = [
    //         CPI_AUTHORITY_PDA_SEED
    //     ],
    //     bump
    // )]
    // pub light_cpi_authority: AccountInfo<'info>,

    // /// CHECK: directly checking seeds
    // #[account(
    //     address = light_sdk::utils::get_registered_program_pda(
    //         &light_sdk::PROGRAM_ID_LIGHT_SYSTEM
    //     )
    // )]
    // pub light_registered_program: AccountInfo<'info>,

    // /// CHECK: directly checking program id
    // #[account(
    //     address = crate::ID
    // )]
    // pub self_program: AccountInfo<'info>,

    // /// CHECK: directly checking address
    // #[account(
    //     address = light_sdk::utils::get_cpi_authority_pda(
    //         &PROGRAM_ID_LIGHT_SYSTEM,
    //     ),
    // )]
    // pub account_compression_authority: AccountInfo<'info>,
}

impl<'info> InitializePool<'info> {
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

        Ok(())
    }

    pub fn validate_stablecoin_vault_and_rederive_bump(
        &self,
        vault_key: &Pubkey,
        stablecoin_mint: &Pubkey
    ) -> Result<u8> {
        // Rederive from bare seeds and compare.
        let (rederived_vault, bump) = Pubkey::find_program_address(
            &[
                VAULT_SEED.as_bytes(),
                self.pool.key().as_ref(),
                stablecoin_mint.key().as_ref()
            ], 
            &program::GeistAmm::id()
        );

        require!(
            rederived_vault.key() == *vault_key,
            GeistError::InvalidVault
        );

        Ok(bump)
    }

    pub fn validate_stablecoin_admin_ata(
        &self,
        ata: &TokenAccount,
        ata_key: &Pubkey,
        mint: &Pubkey,
        deposit: u64,
    ) -> Result<()> {
        // Rederive ata and compare
        let rederived_ata = get_associated_token_address(
            self.admin.key,
            mint
        );

        require!(
            *ata_key == rederived_ata,
            GeistError::InvalidTokenAccount
        );
        
        // If admin is depositing from this ata, make sure the account is initialized and has enough funds.
        if (deposit > 0) {
            require!(
                ata.state == AccountState::Initialized,
                GeistError::AtaNotInitialized
            );

            require!(
                ata.amount >= deposit,
                GeistError::NotEnoughFunds
            );
        }

        Ok(())
    }
}