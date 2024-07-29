use anchor_lang::prelude::*;

#[error_code]
pub enum GeistError {
    #[msg("InvalidCallbackError")]
    InvalidCallbackError,

    #[msg("StablecoinNotSupported")]
    StablecoinNotSupported,

    #[msg("Frozen")]
    Frozen,

    #[msg("InvalidOracle")]
    InvalidOracle,

    #[msg("DuplicatedMints")]
    DuplicatedMints,

    #[msg("NotEnoughTokens")]
    NotEnoughTokens,

    #[msg("CastFailed")]
    CastFailed,

    #[msg("MathOverflow")]
    MathOverflow,

    #[msg("InvariantPrecisionNotFound")]
    InvariantPrecisionNotFound,

    #[msg("DivisionByZero")]
    DivisionByZero,

    #[msg("PoolTokensCountOutOfBound")]
    PoolTokensCountOutOfBound,

    #[msg("InvalidInputLength")]
    InvalidInputLength,

    #[msg("AmplificationCoefficientOutOfBound")]
    AmplificationCoefficientOutOfBound,

    #[msg("LpTokenPreMinted")]
    LpTokenPreMinted,

    #[msg("InvalidMintAuthority")]
    InvalidMintAuthority,

    #[msg("InvalidFreezeAuthority")]
    InvalidFreezeAuthority,

    #[msg("LpTokenNotInitialized")]
    LpTokenNotInitialized
}