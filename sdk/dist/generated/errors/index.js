"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroInitialDepositError = exports.ZeroBalanceError = exports.InsufficientBalanceForWithdrawalError = exports.StablecoinWithdrawOnlyError = exports.SuperadminMismatchError = exports.SlippageExceededError = exports.ProtocolFrozenError = exports.NotEnoughLiquidityError = exports.PoolFrozenError = exports.PoolIdMismatchError = exports.InvalidInputError = exports.NotEnoughFundsError = exports.AtaNotInitializedError = exports.InvalidTokenAccountError = exports.InvalidVaultError = exports.InvalidTokenAccountMintError = exports.InvalidTokenAccountOwnerError = exports.InvalidRemainingAccountsSchemaError = exports.LpTokenNotInitializedError = exports.InvalidFreezeAuthorityError = exports.InvalidMintAuthorityError = exports.LpTokenPreMintedError = exports.AmplificationCoefficientOutOfBoundError = exports.InvalidInputLengthError = exports.PoolTokensCountOutOfBoundError = exports.DivisionByZeroError = exports.InvariantPrecisionNotFoundError = exports.MathOverflowError = exports.CastFailedError = exports.NotEnoughTokensError = exports.DuplicatedMintsError = exports.InvalidOracleError = exports.FrozenError = exports.StablecoinAlreadySupportedError = exports.StablecoinNotSupportedError = exports.InvalidCallbackErrorError = void 0;
exports.errorFromCode = errorFromCode;
exports.errorFromName = errorFromName;
const createErrorFromCodeLookup = new Map();
const createErrorFromNameLookup = new Map();
/**
 * InvalidCallbackError: 'InvalidCallbackError'
 *
 * @category Errors
 * @category generated
 */
class InvalidCallbackErrorError extends Error {
    constructor() {
        super('InvalidCallbackError');
        this.code = 0x1770;
        this.name = 'InvalidCallbackError';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidCallbackErrorError);
        }
    }
}
exports.InvalidCallbackErrorError = InvalidCallbackErrorError;
createErrorFromCodeLookup.set(0x1770, () => new InvalidCallbackErrorError());
createErrorFromNameLookup.set('InvalidCallbackError', () => new InvalidCallbackErrorError());
/**
 * StablecoinNotSupported: 'StablecoinNotSupported'
 *
 * @category Errors
 * @category generated
 */
class StablecoinNotSupportedError extends Error {
    constructor() {
        super('StablecoinNotSupported');
        this.code = 0x1771;
        this.name = 'StablecoinNotSupported';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, StablecoinNotSupportedError);
        }
    }
}
exports.StablecoinNotSupportedError = StablecoinNotSupportedError;
createErrorFromCodeLookup.set(0x1771, () => new StablecoinNotSupportedError());
createErrorFromNameLookup.set('StablecoinNotSupported', () => new StablecoinNotSupportedError());
/**
 * StablecoinAlreadySupported: 'StablecoinAlreadySupported'
 *
 * @category Errors
 * @category generated
 */
class StablecoinAlreadySupportedError extends Error {
    constructor() {
        super('StablecoinAlreadySupported');
        this.code = 0x1772;
        this.name = 'StablecoinAlreadySupported';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, StablecoinAlreadySupportedError);
        }
    }
}
exports.StablecoinAlreadySupportedError = StablecoinAlreadySupportedError;
createErrorFromCodeLookup.set(0x1772, () => new StablecoinAlreadySupportedError());
createErrorFromNameLookup.set('StablecoinAlreadySupported', () => new StablecoinAlreadySupportedError());
/**
 * Frozen: 'Frozen'
 *
 * @category Errors
 * @category generated
 */
class FrozenError extends Error {
    constructor() {
        super('Frozen');
        this.code = 0x1773;
        this.name = 'Frozen';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, FrozenError);
        }
    }
}
exports.FrozenError = FrozenError;
createErrorFromCodeLookup.set(0x1773, () => new FrozenError());
createErrorFromNameLookup.set('Frozen', () => new FrozenError());
/**
 * InvalidOracle: 'InvalidOracle'
 *
 * @category Errors
 * @category generated
 */
class InvalidOracleError extends Error {
    constructor() {
        super('InvalidOracle');
        this.code = 0x1774;
        this.name = 'InvalidOracle';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidOracleError);
        }
    }
}
exports.InvalidOracleError = InvalidOracleError;
createErrorFromCodeLookup.set(0x1774, () => new InvalidOracleError());
createErrorFromNameLookup.set('InvalidOracle', () => new InvalidOracleError());
/**
 * DuplicatedMints: 'DuplicatedMints'
 *
 * @category Errors
 * @category generated
 */
class DuplicatedMintsError extends Error {
    constructor() {
        super('DuplicatedMints');
        this.code = 0x1775;
        this.name = 'DuplicatedMints';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, DuplicatedMintsError);
        }
    }
}
exports.DuplicatedMintsError = DuplicatedMintsError;
createErrorFromCodeLookup.set(0x1775, () => new DuplicatedMintsError());
createErrorFromNameLookup.set('DuplicatedMints', () => new DuplicatedMintsError());
/**
 * NotEnoughTokens: 'NotEnoughTokens'
 *
 * @category Errors
 * @category generated
 */
class NotEnoughTokensError extends Error {
    constructor() {
        super('NotEnoughTokens');
        this.code = 0x1776;
        this.name = 'NotEnoughTokens';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NotEnoughTokensError);
        }
    }
}
exports.NotEnoughTokensError = NotEnoughTokensError;
createErrorFromCodeLookup.set(0x1776, () => new NotEnoughTokensError());
createErrorFromNameLookup.set('NotEnoughTokens', () => new NotEnoughTokensError());
/**
 * CastFailed: 'CastFailed'
 *
 * @category Errors
 * @category generated
 */
class CastFailedError extends Error {
    constructor() {
        super('CastFailed');
        this.code = 0x1777;
        this.name = 'CastFailed';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, CastFailedError);
        }
    }
}
exports.CastFailedError = CastFailedError;
createErrorFromCodeLookup.set(0x1777, () => new CastFailedError());
createErrorFromNameLookup.set('CastFailed', () => new CastFailedError());
/**
 * MathOverflow: 'MathOverflow'
 *
 * @category Errors
 * @category generated
 */
class MathOverflowError extends Error {
    constructor() {
        super('MathOverflow');
        this.code = 0x1778;
        this.name = 'MathOverflow';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, MathOverflowError);
        }
    }
}
exports.MathOverflowError = MathOverflowError;
createErrorFromCodeLookup.set(0x1778, () => new MathOverflowError());
createErrorFromNameLookup.set('MathOverflow', () => new MathOverflowError());
/**
 * InvariantPrecisionNotFound: 'InvariantPrecisionNotFound'
 *
 * @category Errors
 * @category generated
 */
class InvariantPrecisionNotFoundError extends Error {
    constructor() {
        super('InvariantPrecisionNotFound');
        this.code = 0x1779;
        this.name = 'InvariantPrecisionNotFound';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvariantPrecisionNotFoundError);
        }
    }
}
exports.InvariantPrecisionNotFoundError = InvariantPrecisionNotFoundError;
createErrorFromCodeLookup.set(0x1779, () => new InvariantPrecisionNotFoundError());
createErrorFromNameLookup.set('InvariantPrecisionNotFound', () => new InvariantPrecisionNotFoundError());
/**
 * DivisionByZero: 'DivisionByZero'
 *
 * @category Errors
 * @category generated
 */
class DivisionByZeroError extends Error {
    constructor() {
        super('DivisionByZero');
        this.code = 0x177a;
        this.name = 'DivisionByZero';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, DivisionByZeroError);
        }
    }
}
exports.DivisionByZeroError = DivisionByZeroError;
createErrorFromCodeLookup.set(0x177a, () => new DivisionByZeroError());
createErrorFromNameLookup.set('DivisionByZero', () => new DivisionByZeroError());
/**
 * PoolTokensCountOutOfBound: 'PoolTokensCountOutOfBound'
 *
 * @category Errors
 * @category generated
 */
class PoolTokensCountOutOfBoundError extends Error {
    constructor() {
        super('PoolTokensCountOutOfBound');
        this.code = 0x177b;
        this.name = 'PoolTokensCountOutOfBound';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, PoolTokensCountOutOfBoundError);
        }
    }
}
exports.PoolTokensCountOutOfBoundError = PoolTokensCountOutOfBoundError;
createErrorFromCodeLookup.set(0x177b, () => new PoolTokensCountOutOfBoundError());
createErrorFromNameLookup.set('PoolTokensCountOutOfBound', () => new PoolTokensCountOutOfBoundError());
/**
 * InvalidInputLength: 'InvalidInputLength'
 *
 * @category Errors
 * @category generated
 */
class InvalidInputLengthError extends Error {
    constructor() {
        super('InvalidInputLength');
        this.code = 0x177c;
        this.name = 'InvalidInputLength';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidInputLengthError);
        }
    }
}
exports.InvalidInputLengthError = InvalidInputLengthError;
createErrorFromCodeLookup.set(0x177c, () => new InvalidInputLengthError());
createErrorFromNameLookup.set('InvalidInputLength', () => new InvalidInputLengthError());
/**
 * AmplificationCoefficientOutOfBound: 'AmplificationCoefficientOutOfBound'
 *
 * @category Errors
 * @category generated
 */
class AmplificationCoefficientOutOfBoundError extends Error {
    constructor() {
        super('AmplificationCoefficientOutOfBound');
        this.code = 0x177d;
        this.name = 'AmplificationCoefficientOutOfBound';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AmplificationCoefficientOutOfBoundError);
        }
    }
}
exports.AmplificationCoefficientOutOfBoundError = AmplificationCoefficientOutOfBoundError;
createErrorFromCodeLookup.set(0x177d, () => new AmplificationCoefficientOutOfBoundError());
createErrorFromNameLookup.set('AmplificationCoefficientOutOfBound', () => new AmplificationCoefficientOutOfBoundError());
/**
 * LpTokenPreMinted: 'LpTokenPreMinted'
 *
 * @category Errors
 * @category generated
 */
class LpTokenPreMintedError extends Error {
    constructor() {
        super('LpTokenPreMinted');
        this.code = 0x177e;
        this.name = 'LpTokenPreMinted';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, LpTokenPreMintedError);
        }
    }
}
exports.LpTokenPreMintedError = LpTokenPreMintedError;
createErrorFromCodeLookup.set(0x177e, () => new LpTokenPreMintedError());
createErrorFromNameLookup.set('LpTokenPreMinted', () => new LpTokenPreMintedError());
/**
 * InvalidMintAuthority: 'InvalidMintAuthority'
 *
 * @category Errors
 * @category generated
 */
class InvalidMintAuthorityError extends Error {
    constructor() {
        super('InvalidMintAuthority');
        this.code = 0x177f;
        this.name = 'InvalidMintAuthority';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidMintAuthorityError);
        }
    }
}
exports.InvalidMintAuthorityError = InvalidMintAuthorityError;
createErrorFromCodeLookup.set(0x177f, () => new InvalidMintAuthorityError());
createErrorFromNameLookup.set('InvalidMintAuthority', () => new InvalidMintAuthorityError());
/**
 * InvalidFreezeAuthority: 'InvalidFreezeAuthority'
 *
 * @category Errors
 * @category generated
 */
class InvalidFreezeAuthorityError extends Error {
    constructor() {
        super('InvalidFreezeAuthority');
        this.code = 0x1780;
        this.name = 'InvalidFreezeAuthority';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidFreezeAuthorityError);
        }
    }
}
exports.InvalidFreezeAuthorityError = InvalidFreezeAuthorityError;
createErrorFromCodeLookup.set(0x1780, () => new InvalidFreezeAuthorityError());
createErrorFromNameLookup.set('InvalidFreezeAuthority', () => new InvalidFreezeAuthorityError());
/**
 * LpTokenNotInitialized: 'LpTokenNotInitialized'
 *
 * @category Errors
 * @category generated
 */
class LpTokenNotInitializedError extends Error {
    constructor() {
        super('LpTokenNotInitialized');
        this.code = 0x1781;
        this.name = 'LpTokenNotInitialized';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, LpTokenNotInitializedError);
        }
    }
}
exports.LpTokenNotInitializedError = LpTokenNotInitializedError;
createErrorFromCodeLookup.set(0x1781, () => new LpTokenNotInitializedError());
createErrorFromNameLookup.set('LpTokenNotInitialized', () => new LpTokenNotInitializedError());
/**
 * InvalidRemainingAccountsSchema: 'InvalidRemainingAccountsSchema'
 *
 * @category Errors
 * @category generated
 */
class InvalidRemainingAccountsSchemaError extends Error {
    constructor() {
        super('InvalidRemainingAccountsSchema');
        this.code = 0x1782;
        this.name = 'InvalidRemainingAccountsSchema';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidRemainingAccountsSchemaError);
        }
    }
}
exports.InvalidRemainingAccountsSchemaError = InvalidRemainingAccountsSchemaError;
createErrorFromCodeLookup.set(0x1782, () => new InvalidRemainingAccountsSchemaError());
createErrorFromNameLookup.set('InvalidRemainingAccountsSchema', () => new InvalidRemainingAccountsSchemaError());
/**
 * InvalidTokenAccountOwner: 'InvalidTokenAccountOwner'
 *
 * @category Errors
 * @category generated
 */
class InvalidTokenAccountOwnerError extends Error {
    constructor() {
        super('InvalidTokenAccountOwner');
        this.code = 0x1783;
        this.name = 'InvalidTokenAccountOwner';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidTokenAccountOwnerError);
        }
    }
}
exports.InvalidTokenAccountOwnerError = InvalidTokenAccountOwnerError;
createErrorFromCodeLookup.set(0x1783, () => new InvalidTokenAccountOwnerError());
createErrorFromNameLookup.set('InvalidTokenAccountOwner', () => new InvalidTokenAccountOwnerError());
/**
 * InvalidTokenAccountMint: 'InvalidTokenAccountMint'
 *
 * @category Errors
 * @category generated
 */
class InvalidTokenAccountMintError extends Error {
    constructor() {
        super('InvalidTokenAccountMint');
        this.code = 0x1784;
        this.name = 'InvalidTokenAccountMint';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidTokenAccountMintError);
        }
    }
}
exports.InvalidTokenAccountMintError = InvalidTokenAccountMintError;
createErrorFromCodeLookup.set(0x1784, () => new InvalidTokenAccountMintError());
createErrorFromNameLookup.set('InvalidTokenAccountMint', () => new InvalidTokenAccountMintError());
/**
 * InvalidVault: 'InvalidVault'
 *
 * @category Errors
 * @category generated
 */
class InvalidVaultError extends Error {
    constructor() {
        super('InvalidVault');
        this.code = 0x1785;
        this.name = 'InvalidVault';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidVaultError);
        }
    }
}
exports.InvalidVaultError = InvalidVaultError;
createErrorFromCodeLookup.set(0x1785, () => new InvalidVaultError());
createErrorFromNameLookup.set('InvalidVault', () => new InvalidVaultError());
/**
 * InvalidTokenAccount: 'InvalidTokenAccount'
 *
 * @category Errors
 * @category generated
 */
class InvalidTokenAccountError extends Error {
    constructor() {
        super('InvalidTokenAccount');
        this.code = 0x1786;
        this.name = 'InvalidTokenAccount';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidTokenAccountError);
        }
    }
}
exports.InvalidTokenAccountError = InvalidTokenAccountError;
createErrorFromCodeLookup.set(0x1786, () => new InvalidTokenAccountError());
createErrorFromNameLookup.set('InvalidTokenAccount', () => new InvalidTokenAccountError());
/**
 * AtaNotInitialized: 'AtaNotInitialized'
 *
 * @category Errors
 * @category generated
 */
class AtaNotInitializedError extends Error {
    constructor() {
        super('AtaNotInitialized');
        this.code = 0x1787;
        this.name = 'AtaNotInitialized';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AtaNotInitializedError);
        }
    }
}
exports.AtaNotInitializedError = AtaNotInitializedError;
createErrorFromCodeLookup.set(0x1787, () => new AtaNotInitializedError());
createErrorFromNameLookup.set('AtaNotInitialized', () => new AtaNotInitializedError());
/**
 * NotEnoughFunds: 'NotEnoughFunds'
 *
 * @category Errors
 * @category generated
 */
class NotEnoughFundsError extends Error {
    constructor() {
        super('NotEnoughFunds');
        this.code = 0x1788;
        this.name = 'NotEnoughFunds';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NotEnoughFundsError);
        }
    }
}
exports.NotEnoughFundsError = NotEnoughFundsError;
createErrorFromCodeLookup.set(0x1788, () => new NotEnoughFundsError());
createErrorFromNameLookup.set('NotEnoughFunds', () => new NotEnoughFundsError());
/**
 * InvalidInput: 'InvalidInput'
 *
 * @category Errors
 * @category generated
 */
class InvalidInputError extends Error {
    constructor() {
        super('InvalidInput');
        this.code = 0x1789;
        this.name = 'InvalidInput';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidInputError);
        }
    }
}
exports.InvalidInputError = InvalidInputError;
createErrorFromCodeLookup.set(0x1789, () => new InvalidInputError());
createErrorFromNameLookup.set('InvalidInput', () => new InvalidInputError());
/**
 * PoolIdMismatch: 'PoolIdMismatch'
 *
 * @category Errors
 * @category generated
 */
class PoolIdMismatchError extends Error {
    constructor() {
        super('PoolIdMismatch');
        this.code = 0x178a;
        this.name = 'PoolIdMismatch';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, PoolIdMismatchError);
        }
    }
}
exports.PoolIdMismatchError = PoolIdMismatchError;
createErrorFromCodeLookup.set(0x178a, () => new PoolIdMismatchError());
createErrorFromNameLookup.set('PoolIdMismatch', () => new PoolIdMismatchError());
/**
 * PoolFrozen: 'PoolFrozen'
 *
 * @category Errors
 * @category generated
 */
class PoolFrozenError extends Error {
    constructor() {
        super('PoolFrozen');
        this.code = 0x178b;
        this.name = 'PoolFrozen';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, PoolFrozenError);
        }
    }
}
exports.PoolFrozenError = PoolFrozenError;
createErrorFromCodeLookup.set(0x178b, () => new PoolFrozenError());
createErrorFromNameLookup.set('PoolFrozen', () => new PoolFrozenError());
/**
 * NotEnoughLiquidity: 'NotEnoughLiquidity'
 *
 * @category Errors
 * @category generated
 */
class NotEnoughLiquidityError extends Error {
    constructor() {
        super('NotEnoughLiquidity');
        this.code = 0x178c;
        this.name = 'NotEnoughLiquidity';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NotEnoughLiquidityError);
        }
    }
}
exports.NotEnoughLiquidityError = NotEnoughLiquidityError;
createErrorFromCodeLookup.set(0x178c, () => new NotEnoughLiquidityError());
createErrorFromNameLookup.set('NotEnoughLiquidity', () => new NotEnoughLiquidityError());
/**
 * ProtocolFrozen: 'ProtocolFrozen'
 *
 * @category Errors
 * @category generated
 */
class ProtocolFrozenError extends Error {
    constructor() {
        super('ProtocolFrozen');
        this.code = 0x178d;
        this.name = 'ProtocolFrozen';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, ProtocolFrozenError);
        }
    }
}
exports.ProtocolFrozenError = ProtocolFrozenError;
createErrorFromCodeLookup.set(0x178d, () => new ProtocolFrozenError());
createErrorFromNameLookup.set('ProtocolFrozen', () => new ProtocolFrozenError());
/**
 * SlippageExceeded: 'SlippageExceeded'
 *
 * @category Errors
 * @category generated
 */
class SlippageExceededError extends Error {
    constructor() {
        super('SlippageExceeded');
        this.code = 0x178e;
        this.name = 'SlippageExceeded';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, SlippageExceededError);
        }
    }
}
exports.SlippageExceededError = SlippageExceededError;
createErrorFromCodeLookup.set(0x178e, () => new SlippageExceededError());
createErrorFromNameLookup.set('SlippageExceeded', () => new SlippageExceededError());
/**
 * SuperadminMismatch: 'InvalidSuperadmin'
 *
 * @category Errors
 * @category generated
 */
class SuperadminMismatchError extends Error {
    constructor() {
        super('InvalidSuperadmin');
        this.code = 0x178f;
        this.name = 'SuperadminMismatch';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, SuperadminMismatchError);
        }
    }
}
exports.SuperadminMismatchError = SuperadminMismatchError;
createErrorFromCodeLookup.set(0x178f, () => new SuperadminMismatchError());
createErrorFromNameLookup.set('SuperadminMismatch', () => new SuperadminMismatchError());
/**
 * StablecoinWithdrawOnly: 'StablecoinWithdrawOnly'
 *
 * @category Errors
 * @category generated
 */
class StablecoinWithdrawOnlyError extends Error {
    constructor() {
        super('StablecoinWithdrawOnly');
        this.code = 0x1790;
        this.name = 'StablecoinWithdrawOnly';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, StablecoinWithdrawOnlyError);
        }
    }
}
exports.StablecoinWithdrawOnlyError = StablecoinWithdrawOnlyError;
createErrorFromCodeLookup.set(0x1790, () => new StablecoinWithdrawOnlyError());
createErrorFromNameLookup.set('StablecoinWithdrawOnly', () => new StablecoinWithdrawOnlyError());
/**
 * InsufficientBalanceForWithdrawal: 'InsufficientBalanceForWithdrawal'
 *
 * @category Errors
 * @category generated
 */
class InsufficientBalanceForWithdrawalError extends Error {
    constructor() {
        super('InsufficientBalanceForWithdrawal');
        this.code = 0x1791;
        this.name = 'InsufficientBalanceForWithdrawal';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InsufficientBalanceForWithdrawalError);
        }
    }
}
exports.InsufficientBalanceForWithdrawalError = InsufficientBalanceForWithdrawalError;
createErrorFromCodeLookup.set(0x1791, () => new InsufficientBalanceForWithdrawalError());
createErrorFromNameLookup.set('InsufficientBalanceForWithdrawal', () => new InsufficientBalanceForWithdrawalError());
/**
 * ZeroBalance: 'ZeroBalance'
 *
 * @category Errors
 * @category generated
 */
class ZeroBalanceError extends Error {
    constructor() {
        super('ZeroBalance');
        this.code = 0x1792;
        this.name = 'ZeroBalance';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, ZeroBalanceError);
        }
    }
}
exports.ZeroBalanceError = ZeroBalanceError;
createErrorFromCodeLookup.set(0x1792, () => new ZeroBalanceError());
createErrorFromNameLookup.set('ZeroBalance', () => new ZeroBalanceError());
/**
 * ZeroInitialDeposit: 'ZeroInitialDeposit'
 *
 * @category Errors
 * @category generated
 */
class ZeroInitialDepositError extends Error {
    constructor() {
        super('ZeroInitialDeposit');
        this.code = 0x1793;
        this.name = 'ZeroInitialDeposit';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, ZeroInitialDepositError);
        }
    }
}
exports.ZeroInitialDepositError = ZeroInitialDepositError;
createErrorFromCodeLookup.set(0x1793, () => new ZeroInitialDepositError());
createErrorFromNameLookup.set('ZeroInitialDeposit', () => new ZeroInitialDepositError());
/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
function errorFromCode(code) {
    const createError = createErrorFromCodeLookup.get(code);
    return createError != null ? createError() : null;
}
/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
function errorFromName(name) {
    const createError = createErrorFromNameLookup.get(name);
    return createError != null ? createError() : null;
}