use anchor_lang::prelude::*;
use anchor_spl::token::{
    mint_to,
    MintTo,
};
use crate::states::*;
use crate::constants::*;
use crate::errors::GeistError;

#[account]
pub struct MultiPool {
    pub index: u64, // 8
    pub bump: u8, // 1 
    pub admin: Pubkey, // 32
    pub stablecoins: Vec<Pubkey>, // 4 + k*32
    pub amp: u64, // 8
    pub is_frozen: bool, // 1
    pub lp_token: Pubkey, // 32
    pub swap: StableSwap, // StableSwap::SIZE
    pub fees: Fees // Fees::SIZE
}

impl MultiPool {
    pub const INITIAL_SIZE: usize = 8 +
        32 * 2 +
        8 * 2 +
        1 +
        4 +
        1 +
        StableSwap::SIZE as usize +
        Fees::SIZE as usize;

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