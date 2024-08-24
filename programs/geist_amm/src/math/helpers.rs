pub fn rescale_to_max_precision(
    balance: u64,
    decimals: u8
) -> u64 {
    balance * 10_u64.pow(9 - (decimals as u32))
}

pub fn rescale_to_decimals(
    balance_with_precision: u64,
    decimals: u8
) -> u64 {
    balance_with_precision / 10_u64.pow(9 - (decimals as u32))
}