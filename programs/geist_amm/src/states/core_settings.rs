use anchor_lang::prelude::*;

#[account]
pub struct Core {
    // Index used for derivation of PDA of the next pool.
    pub next_pool_id: u64, // 8

    // Superadmin is an address authorized to add new stablecoins into the basket.
    pub superadmin: Pubkey, // 32

    // Platform fee taken from the fees collected by liquidity pool.
    // If pool has 1% fee and platform fee is 25%, effectively platform earns 0.25% of each swap.
    pub platform_fee_bps: u64,

    // Token addresses of all stablecoins supported by the protocol.
    pub supported_stablecoins: Vec<Pubkey>, // 4 + k * 32

    // Token addresses of all stablecoins in withdraw-only mode.
    pub withdraw_only_stablecoins: Vec<Pubkey>, // 4 + k * 32

    // If frozen, break the transaction flow.
    pub is_frozen: bool, // 1
}

impl Core {
    pub const INITIAL_SIZE: usize = 8 + 8 + 32 + 8 + 4 + 4 + 1;

    pub fn set_new_superadmin(&mut self, new_superadmin: Pubkey) {
        self.superadmin = new_superadmin;
    }

    pub fn add_stablecoin(&mut self, new_stablecoin: Pubkey) {
        self.supported_stablecoins.push(new_stablecoin);
    }

    pub fn update_fee(&mut self, platform_fee_bps: u64) {
        self.platform_fee_bps = platform_fee_bps;
    }

    pub fn disable_stablecoin(&mut self, stablecoin: Pubkey) {
        let position = self.supported_stablecoins.iter().position(|s| *s == stablecoin).unwrap();
        self.supported_stablecoins.remove(position);
        self.withdraw_only_stablecoins.push(stablecoin);
    }

    pub fn reenable_stablecoin(&mut self, stablecoin: Pubkey) {
        let position = self.withdraw_only_stablecoins.iter().position(|s| *s == stablecoin).unwrap();
        self.withdraw_only_stablecoins.remove(position);
        self.add_stablecoin(stablecoin);
    }

    pub fn freeze(&mut self) {
        self.is_frozen = true;
    }

    pub fn unfreeze(&mut self) {
        self.is_frozen = false;
    }
}