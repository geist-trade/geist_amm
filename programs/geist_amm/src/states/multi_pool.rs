use anchor_lang::prelude::*;
use crate::states::*;

#[account]
pub struct MultiPool {
    pub index: u64, // 8
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
        4 +
        1 +
        StableSwap::SIZE as usize +
        Fees::SIZE as usize;
    
}