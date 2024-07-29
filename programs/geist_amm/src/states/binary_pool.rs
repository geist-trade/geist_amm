use anchor_lang::prelude::*;
use crate::states::*;

#[account]
pub struct BinaryPool {
    pub index: u64, // 8
    pub admin: Pubkey, // 32
    pub stablecoin_a: Pubkey, // 32
    pub stablecoin_b: Pubkey, // 32
    pub amp: u64, // 8
    pub is_frozen: bool, // 1
    pub lp_token: Pubkey, // 32
    pub swap: StableSwap,
    pub fees: Fees
}

impl BinaryPool {
    pub const INITIAL_SIZE: u64 = 8 + // anchor
        32 * 4 + // 4 PublicKeys
        8 + // Amp
        1 +  // is_frozen
        StableSwap::SIZE + // StableSwap
        Fees::SIZE; // Fees struct
}