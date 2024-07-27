use anchor_lang::prelude::*;

#[account]
pub struct BinaryPool {
    pub index: u64, // 8
    pub admin: Pubkey, // 32
    pub stablecoin_a: Pubkey, // 32
    pub stablecoin_b: Pubkey, // 32
    pub amp: u64, // 8
    pub is_frozen: bool, // 1
    pub lp_token: Pubkey, // 32
    pub liquidity_removal_fee_bps: u64, // 8
    pub swap_fee_bps: u64, // 8
    pub swap: StableSwap,
}

impl BinaryPool {
    pub const INITIAL_SIZE: usize = 8 + 32 * 4 + 8 * 4 + 1;
}