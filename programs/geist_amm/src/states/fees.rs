use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct Fees {
    pub swap_fee_bps: u64, // 8
    pub liquidity_removal_fee_bps: u64, // 8
}

impl Fees {
    pub const SIZE: u64 = 2 * 8;
}