pub mod instructions;
pub mod constants;
pub mod states;
pub mod errors;
pub mod math;

use anchor_lang::prelude::*;
use crate::instructions::*;

declare_id!("AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n");

#[program]
pub mod geist {
    use super::*;

    pub fn initialize_core(
        ctx: Context<InitializeCore>
    ) -> Result<()> {
        instructions::initialize_core(
            ctx
        )
    }
}

