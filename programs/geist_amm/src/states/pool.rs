use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token;
use anchor_spl::token::{
    mint_to,
    MintTo,
};
use crate::states::*;
use crate::constants::*;
use crate::errors::GeistError;
// use light_compressed_token::cpi::{
//     create_token_pool,
//     mint_to as mint_compressed_to,
//     accounts::{
//         MintToInstruction as MintCompressedToInstruction,
//         CreateTokenPoolInstruction
//     }
// };
use crate::borsh;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy, Debug)]
pub enum TokenMode {
    SPL,
    COMPRESSED,
}

#[account]
pub struct Pool {
    pub index: u64, // 8
    pub bump: u8, // 1 
    pub admin: Pubkey, // 32
    pub stablecoins: Vec<Pubkey>, // 4 + k*32
    pub is_frozen: bool, // 1
    pub lp_token: Pubkey, // 32
    pub swap: StableSwap, // StableSwap::SIZE
    pub fees: Fees, // Fees::SIZE
    pub token_mode: TokenMode, // 1
}

impl Pool {
    pub const INITIAL_SIZE: usize = 8 +
        32 * 2 +
        8 * 2 +
        1 +
        4 +
        1 +
        StableSwap::SIZE as usize +
        Fees::SIZE as usize +
        1; // token_mode

    pub fn mint_compressed_lp_tokens<'a>(
        &self,
        fee_payer: &AccountInfo<'a>,
        authority: &AccountInfo<'a>,
        mint: &AccountInfo<'a>,
        merkle_tree: &AccountInfo<'a>,
        recipient: &AccountInfo<'a>,
        cpi_authority_pda: &AccountInfo<'a>,
        token_program: &AccountInfo<'a>,
        compressed_token_program: &AccountInfo<'a>,
        light_system_program: &AccountInfo<'a>,
        registered_program_pda: &AccountInfo<'a>,
        noop_program: &AccountInfo<'a>,
        account_compression_authority: &AccountInfo<'a>,
        account_compression_program: &AccountInfo<'a>,
        self_program: &AccountInfo<'a>,
        system_program: &AccountInfo<'a>,
        token_pool_pda: &AccountInfo<'a>,
        amount: u64
    ) -> Result<()> {
        // mint_compressed_to(
        //     CpiContext::new(
        //         compressed_token_program.to_account_info(), 
        //         MintCompressedToInstruction {
        //             account_compression_authority: account_compression_authority.clone(),
        //             account_compression_program: account_compression_program.clone(),
        //             fee_payer: fee_payer.clone(),
        //             authority: authority.clone(),
        //             cpi_authority_pda: cpi_authority_pda.clone(),
        //             light_system_program: light_system_program.clone(),
        //             merkle_tree: merkle_tree.clone(),
        //             mint: mint.clone(),
        //             noop_program: noop_program.clone(),
        //             registered_program_pda: registered_program_pda.clone(),
        //             self_program: self_program.clone(),
        //             sol_pool_pda: None,
        //             system_program: system_program.clone(),
        //             token_pool_pda: token_pool_pda.clone(),
        //             token_program: token_program.clone()
        //         },
        //     ),
        //     vec![recipient.key()],
        //     vec![amount],
        //     Some(0)
        // )?;

        Ok(())
    }

    // Initialize compressed account for the mint at the moment of pool initialization.
    // This will allow for minting LP token as compressed token during liquidity provision.
    pub fn initialize_compressed_lp_token_pool<'a>(
        &self,
        fee_payer: &AccountInfo<'a>,
        mint: &AccountInfo<'a>,
        token_pool_pda: &AccountInfo<'a>,
        system_program: &AccountInfo<'a>,
        token_program: &AccountInfo<'a>,
        cpi_authority_pda: &AccountInfo<'a>,
        compressed_token_program: &AccountInfo<'a>,
    ) -> Result<()> {

        // let signer_seeds: &[_; 0] = &[];

        // create_token_pool(
        //     CpiContext::new_with_signer(
        //         compressed_token_program.to_account_info(), 
        //         CreateTokenPoolInstruction {
        //             cpi_authority_pda: cpi_authority_pda.clone(),
        //             fee_payer: fee_payer.clone(),
        //             mint: mint.clone(),
        //             system_program: system_program.clone(),
        //             token_pool_pda: token_pool_pda.clone(),
        //             token_program: token_program.clone()
        //         }, 
        //         &[signer_seeds]
        //     )
        // )?;

        Ok(())
    }

    pub fn mint_lp_tokens<'a>(
        &self,
        amount: u64,
        token_program: AccountInfo<'a>,
        mint: AccountInfo<'a>,
        to: AccountInfo<'a>,
        authority: AccountInfo<'a>
    ) -> Result<()> {
        require!(
            *mint.key == self.lp_token,
            GeistError::InvalidInput
        );

        let signer_seeds = &[
            BINARY_POOL_SEED.as_bytes(),
            &self.index.to_le_bytes(),
            &[self.bump]
        ];

        mint_to(
            CpiContext::new_with_signer(
                token_program, 
                MintTo {
                    mint,
                    to,
                    authority
                }, 
                &[signer_seeds]
            ), 
            amount
        )?;

        Ok(())
    }
}