/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

type ErrorWithCode = Error & { code: number }
type MaybeErrorWithCode = ErrorWithCode | null | undefined

const createErrorFromCodeLookup: Map<number, () => ErrorWithCode> = new Map()
const createErrorFromNameLookup: Map<string, () => ErrorWithCode> = new Map()

/**
 * InvalidCallbackError: 'InvalidCallbackError'
 *
 * @category Errors
 * @category generated
 */
export class InvalidCallbackErrorError extends Error {
  readonly code: number = 0x1770
  readonly name: string = 'InvalidCallbackError'
  constructor() {
    super('InvalidCallbackError')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidCallbackErrorError)
    }
  }
}

createErrorFromCodeLookup.set(0x1770, () => new InvalidCallbackErrorError())
createErrorFromNameLookup.set(
  'InvalidCallbackError',
  () => new InvalidCallbackErrorError()
)

/**
 * StablecoinNotSupported: 'StablecoinNotSupported'
 *
 * @category Errors
 * @category generated
 */
export class StablecoinNotSupportedError extends Error {
  readonly code: number = 0x1771
  readonly name: string = 'StablecoinNotSupported'
  constructor() {
    super('StablecoinNotSupported')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, StablecoinNotSupportedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1771, () => new StablecoinNotSupportedError())
createErrorFromNameLookup.set(
  'StablecoinNotSupported',
  () => new StablecoinNotSupportedError()
)

/**
 * StablecoinAlreadySupported: 'StablecoinAlreadySupported'
 *
 * @category Errors
 * @category generated
 */
export class StablecoinAlreadySupportedError extends Error {
  readonly code: number = 0x1772
  readonly name: string = 'StablecoinAlreadySupported'
  constructor() {
    super('StablecoinAlreadySupported')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, StablecoinAlreadySupportedError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1772,
  () => new StablecoinAlreadySupportedError()
)
createErrorFromNameLookup.set(
  'StablecoinAlreadySupported',
  () => new StablecoinAlreadySupportedError()
)

/**
 * Frozen: 'Frozen'
 *
 * @category Errors
 * @category generated
 */
export class FrozenError extends Error {
  readonly code: number = 0x1773
  readonly name: string = 'Frozen'
  constructor() {
    super('Frozen')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, FrozenError)
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new FrozenError())
createErrorFromNameLookup.set('Frozen', () => new FrozenError())

/**
 * InvalidOracle: 'InvalidOracle'
 *
 * @category Errors
 * @category generated
 */
export class InvalidOracleError extends Error {
  readonly code: number = 0x1774
  readonly name: string = 'InvalidOracle'
  constructor() {
    super('InvalidOracle')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidOracleError)
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new InvalidOracleError())
createErrorFromNameLookup.set('InvalidOracle', () => new InvalidOracleError())

/**
 * DuplicatedMints: 'DuplicatedMints'
 *
 * @category Errors
 * @category generated
 */
export class DuplicatedMintsError extends Error {
  readonly code: number = 0x1775
  readonly name: string = 'DuplicatedMints'
  constructor() {
    super('DuplicatedMints')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DuplicatedMintsError)
    }
  }
}

createErrorFromCodeLookup.set(0x1775, () => new DuplicatedMintsError())
createErrorFromNameLookup.set(
  'DuplicatedMints',
  () => new DuplicatedMintsError()
)

/**
 * NotEnoughTokens: 'NotEnoughTokens'
 *
 * @category Errors
 * @category generated
 */
export class NotEnoughTokensError extends Error {
  readonly code: number = 0x1776
  readonly name: string = 'NotEnoughTokens'
  constructor() {
    super('NotEnoughTokens')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NotEnoughTokensError)
    }
  }
}

createErrorFromCodeLookup.set(0x1776, () => new NotEnoughTokensError())
createErrorFromNameLookup.set(
  'NotEnoughTokens',
  () => new NotEnoughTokensError()
)

/**
 * CastFailed: 'CastFailed'
 *
 * @category Errors
 * @category generated
 */
export class CastFailedError extends Error {
  readonly code: number = 0x1777
  readonly name: string = 'CastFailed'
  constructor() {
    super('CastFailed')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, CastFailedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1777, () => new CastFailedError())
createErrorFromNameLookup.set('CastFailed', () => new CastFailedError())

/**
 * MathOverflow: 'MathOverflow'
 *
 * @category Errors
 * @category generated
 */
export class MathOverflowError extends Error {
  readonly code: number = 0x1778
  readonly name: string = 'MathOverflow'
  constructor() {
    super('MathOverflow')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, MathOverflowError)
    }
  }
}

createErrorFromCodeLookup.set(0x1778, () => new MathOverflowError())
createErrorFromNameLookup.set('MathOverflow', () => new MathOverflowError())

/**
 * InvariantPrecisionNotFound: 'InvariantPrecisionNotFound'
 *
 * @category Errors
 * @category generated
 */
export class InvariantPrecisionNotFoundError extends Error {
  readonly code: number = 0x1779
  readonly name: string = 'InvariantPrecisionNotFound'
  constructor() {
    super('InvariantPrecisionNotFound')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvariantPrecisionNotFoundError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1779,
  () => new InvariantPrecisionNotFoundError()
)
createErrorFromNameLookup.set(
  'InvariantPrecisionNotFound',
  () => new InvariantPrecisionNotFoundError()
)

/**
 * DivisionByZero: 'DivisionByZero'
 *
 * @category Errors
 * @category generated
 */
export class DivisionByZeroError extends Error {
  readonly code: number = 0x177a
  readonly name: string = 'DivisionByZero'
  constructor() {
    super('DivisionByZero')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DivisionByZeroError)
    }
  }
}

createErrorFromCodeLookup.set(0x177a, () => new DivisionByZeroError())
createErrorFromNameLookup.set('DivisionByZero', () => new DivisionByZeroError())

/**
 * PoolTokensCountOutOfBound: 'PoolTokensCountOutOfBound'
 *
 * @category Errors
 * @category generated
 */
export class PoolTokensCountOutOfBoundError extends Error {
  readonly code: number = 0x177b
  readonly name: string = 'PoolTokensCountOutOfBound'
  constructor() {
    super('PoolTokensCountOutOfBound')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PoolTokensCountOutOfBoundError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x177b,
  () => new PoolTokensCountOutOfBoundError()
)
createErrorFromNameLookup.set(
  'PoolTokensCountOutOfBound',
  () => new PoolTokensCountOutOfBoundError()
)

/**
 * InvalidInputLength: 'InvalidInputLength'
 *
 * @category Errors
 * @category generated
 */
export class InvalidInputLengthError extends Error {
  readonly code: number = 0x177c
  readonly name: string = 'InvalidInputLength'
  constructor() {
    super('InvalidInputLength')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidInputLengthError)
    }
  }
}

createErrorFromCodeLookup.set(0x177c, () => new InvalidInputLengthError())
createErrorFromNameLookup.set(
  'InvalidInputLength',
  () => new InvalidInputLengthError()
)

/**
 * AmplificationCoefficientOutOfBound: 'AmplificationCoefficientOutOfBound'
 *
 * @category Errors
 * @category generated
 */
export class AmplificationCoefficientOutOfBoundError extends Error {
  readonly code: number = 0x177d
  readonly name: string = 'AmplificationCoefficientOutOfBound'
  constructor() {
    super('AmplificationCoefficientOutOfBound')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AmplificationCoefficientOutOfBoundError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x177d,
  () => new AmplificationCoefficientOutOfBoundError()
)
createErrorFromNameLookup.set(
  'AmplificationCoefficientOutOfBound',
  () => new AmplificationCoefficientOutOfBoundError()
)

/**
 * LpTokenPreMinted: 'LpTokenPreMinted'
 *
 * @category Errors
 * @category generated
 */
export class LpTokenPreMintedError extends Error {
  readonly code: number = 0x177e
  readonly name: string = 'LpTokenPreMinted'
  constructor() {
    super('LpTokenPreMinted')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, LpTokenPreMintedError)
    }
  }
}

createErrorFromCodeLookup.set(0x177e, () => new LpTokenPreMintedError())
createErrorFromNameLookup.set(
  'LpTokenPreMinted',
  () => new LpTokenPreMintedError()
)

/**
 * InvalidMintAuthority: 'InvalidMintAuthority'
 *
 * @category Errors
 * @category generated
 */
export class InvalidMintAuthorityError extends Error {
  readonly code: number = 0x177f
  readonly name: string = 'InvalidMintAuthority'
  constructor() {
    super('InvalidMintAuthority')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidMintAuthorityError)
    }
  }
}

createErrorFromCodeLookup.set(0x177f, () => new InvalidMintAuthorityError())
createErrorFromNameLookup.set(
  'InvalidMintAuthority',
  () => new InvalidMintAuthorityError()
)

/**
 * InvalidFreezeAuthority: 'InvalidFreezeAuthority'
 *
 * @category Errors
 * @category generated
 */
export class InvalidFreezeAuthorityError extends Error {
  readonly code: number = 0x1780
  readonly name: string = 'InvalidFreezeAuthority'
  constructor() {
    super('InvalidFreezeAuthority')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidFreezeAuthorityError)
    }
  }
}

createErrorFromCodeLookup.set(0x1780, () => new InvalidFreezeAuthorityError())
createErrorFromNameLookup.set(
  'InvalidFreezeAuthority',
  () => new InvalidFreezeAuthorityError()
)

/**
 * LpTokenNotInitialized: 'LpTokenNotInitialized'
 *
 * @category Errors
 * @category generated
 */
export class LpTokenNotInitializedError extends Error {
  readonly code: number = 0x1781
  readonly name: string = 'LpTokenNotInitialized'
  constructor() {
    super('LpTokenNotInitialized')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, LpTokenNotInitializedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1781, () => new LpTokenNotInitializedError())
createErrorFromNameLookup.set(
  'LpTokenNotInitialized',
  () => new LpTokenNotInitializedError()
)

/**
 * InvalidRemainingAccountsSchema: 'InvalidRemainingAccountsSchema'
 *
 * @category Errors
 * @category generated
 */
export class InvalidRemainingAccountsSchemaError extends Error {
  readonly code: number = 0x1782
  readonly name: string = 'InvalidRemainingAccountsSchema'
  constructor() {
    super('InvalidRemainingAccountsSchema')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidRemainingAccountsSchemaError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1782,
  () => new InvalidRemainingAccountsSchemaError()
)
createErrorFromNameLookup.set(
  'InvalidRemainingAccountsSchema',
  () => new InvalidRemainingAccountsSchemaError()
)

/**
 * InvalidTokenAccountOwner: 'InvalidTokenAccountOwner'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenAccountOwnerError extends Error {
  readonly code: number = 0x1783
  readonly name: string = 'InvalidTokenAccountOwner'
  constructor() {
    super('InvalidTokenAccountOwner')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidTokenAccountOwnerError)
    }
  }
}

createErrorFromCodeLookup.set(0x1783, () => new InvalidTokenAccountOwnerError())
createErrorFromNameLookup.set(
  'InvalidTokenAccountOwner',
  () => new InvalidTokenAccountOwnerError()
)

/**
 * InvalidTokenAccountMint: 'InvalidTokenAccountMint'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenAccountMintError extends Error {
  readonly code: number = 0x1784
  readonly name: string = 'InvalidTokenAccountMint'
  constructor() {
    super('InvalidTokenAccountMint')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidTokenAccountMintError)
    }
  }
}

createErrorFromCodeLookup.set(0x1784, () => new InvalidTokenAccountMintError())
createErrorFromNameLookup.set(
  'InvalidTokenAccountMint',
  () => new InvalidTokenAccountMintError()
)

/**
 * InvalidVault: 'InvalidVault'
 *
 * @category Errors
 * @category generated
 */
export class InvalidVaultError extends Error {
  readonly code: number = 0x1785
  readonly name: string = 'InvalidVault'
  constructor() {
    super('InvalidVault')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidVaultError)
    }
  }
}

createErrorFromCodeLookup.set(0x1785, () => new InvalidVaultError())
createErrorFromNameLookup.set('InvalidVault', () => new InvalidVaultError())

/**
 * InvalidTokenAccount: 'InvalidTokenAccount'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenAccountError extends Error {
  readonly code: number = 0x1786
  readonly name: string = 'InvalidTokenAccount'
  constructor() {
    super('InvalidTokenAccount')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidTokenAccountError)
    }
  }
}

createErrorFromCodeLookup.set(0x1786, () => new InvalidTokenAccountError())
createErrorFromNameLookup.set(
  'InvalidTokenAccount',
  () => new InvalidTokenAccountError()
)

/**
 * AtaNotInitialized: 'AtaNotInitialized'
 *
 * @category Errors
 * @category generated
 */
export class AtaNotInitializedError extends Error {
  readonly code: number = 0x1787
  readonly name: string = 'AtaNotInitialized'
  constructor() {
    super('AtaNotInitialized')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AtaNotInitializedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1787, () => new AtaNotInitializedError())
createErrorFromNameLookup.set(
  'AtaNotInitialized',
  () => new AtaNotInitializedError()
)

/**
 * NotEnoughFunds: 'NotEnoughFunds'
 *
 * @category Errors
 * @category generated
 */
export class NotEnoughFundsError extends Error {
  readonly code: number = 0x1788
  readonly name: string = 'NotEnoughFunds'
  constructor() {
    super('NotEnoughFunds')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NotEnoughFundsError)
    }
  }
}

createErrorFromCodeLookup.set(0x1788, () => new NotEnoughFundsError())
createErrorFromNameLookup.set('NotEnoughFunds', () => new NotEnoughFundsError())

/**
 * InvalidInput: 'InvalidInput'
 *
 * @category Errors
 * @category generated
 */
export class InvalidInputError extends Error {
  readonly code: number = 0x1789
  readonly name: string = 'InvalidInput'
  constructor() {
    super('InvalidInput')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidInputError)
    }
  }
}

createErrorFromCodeLookup.set(0x1789, () => new InvalidInputError())
createErrorFromNameLookup.set('InvalidInput', () => new InvalidInputError())

/**
 * PoolIdMismatch: 'PoolIdMismatch'
 *
 * @category Errors
 * @category generated
 */
export class PoolIdMismatchError extends Error {
  readonly code: number = 0x178a
  readonly name: string = 'PoolIdMismatch'
  constructor() {
    super('PoolIdMismatch')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PoolIdMismatchError)
    }
  }
}

createErrorFromCodeLookup.set(0x178a, () => new PoolIdMismatchError())
createErrorFromNameLookup.set('PoolIdMismatch', () => new PoolIdMismatchError())

/**
 * PoolFrozen: 'PoolFrozen'
 *
 * @category Errors
 * @category generated
 */
export class PoolFrozenError extends Error {
  readonly code: number = 0x178b
  readonly name: string = 'PoolFrozen'
  constructor() {
    super('PoolFrozen')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PoolFrozenError)
    }
  }
}

createErrorFromCodeLookup.set(0x178b, () => new PoolFrozenError())
createErrorFromNameLookup.set('PoolFrozen', () => new PoolFrozenError())

/**
 * NotEnoughLiquidity: 'NotEnoughLiquidity'
 *
 * @category Errors
 * @category generated
 */
export class NotEnoughLiquidityError extends Error {
  readonly code: number = 0x178c
  readonly name: string = 'NotEnoughLiquidity'
  constructor() {
    super('NotEnoughLiquidity')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NotEnoughLiquidityError)
    }
  }
}

createErrorFromCodeLookup.set(0x178c, () => new NotEnoughLiquidityError())
createErrorFromNameLookup.set(
  'NotEnoughLiquidity',
  () => new NotEnoughLiquidityError()
)

/**
 * ProtocolFrozen: 'ProtocolFrozen'
 *
 * @category Errors
 * @category generated
 */
export class ProtocolFrozenError extends Error {
  readonly code: number = 0x178d
  readonly name: string = 'ProtocolFrozen'
  constructor() {
    super('ProtocolFrozen')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ProtocolFrozenError)
    }
  }
}

createErrorFromCodeLookup.set(0x178d, () => new ProtocolFrozenError())
createErrorFromNameLookup.set('ProtocolFrozen', () => new ProtocolFrozenError())

/**
 * SlippageExceeded: 'SlippageExceeded'
 *
 * @category Errors
 * @category generated
 */
export class SlippageExceededError extends Error {
  readonly code: number = 0x178e
  readonly name: string = 'SlippageExceeded'
  constructor() {
    super('SlippageExceeded')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, SlippageExceededError)
    }
  }
}

createErrorFromCodeLookup.set(0x178e, () => new SlippageExceededError())
createErrorFromNameLookup.set(
  'SlippageExceeded',
  () => new SlippageExceededError()
)

/**
 * SuperadminMismatch: 'InvalidSuperadmin'
 *
 * @category Errors
 * @category generated
 */
export class SuperadminMismatchError extends Error {
  readonly code: number = 0x178f
  readonly name: string = 'SuperadminMismatch'
  constructor() {
    super('InvalidSuperadmin')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, SuperadminMismatchError)
    }
  }
}

createErrorFromCodeLookup.set(0x178f, () => new SuperadminMismatchError())
createErrorFromNameLookup.set(
  'SuperadminMismatch',
  () => new SuperadminMismatchError()
)

/**
 * StablecoinWithdrawOnly: 'StablecoinWithdrawOnly'
 *
 * @category Errors
 * @category generated
 */
export class StablecoinWithdrawOnlyError extends Error {
  readonly code: number = 0x1790
  readonly name: string = 'StablecoinWithdrawOnly'
  constructor() {
    super('StablecoinWithdrawOnly')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, StablecoinWithdrawOnlyError)
    }
  }
}

createErrorFromCodeLookup.set(0x1790, () => new StablecoinWithdrawOnlyError())
createErrorFromNameLookup.set(
  'StablecoinWithdrawOnly',
  () => new StablecoinWithdrawOnlyError()
)

/**
 * InsufficientBalanceForWithdrawal: 'InsufficientBalanceForWithdrawal'
 *
 * @category Errors
 * @category generated
 */
export class InsufficientBalanceForWithdrawalError extends Error {
  readonly code: number = 0x1791
  readonly name: string = 'InsufficientBalanceForWithdrawal'
  constructor() {
    super('InsufficientBalanceForWithdrawal')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InsufficientBalanceForWithdrawalError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1791,
  () => new InsufficientBalanceForWithdrawalError()
)
createErrorFromNameLookup.set(
  'InsufficientBalanceForWithdrawal',
  () => new InsufficientBalanceForWithdrawalError()
)

/**
 * ZeroBalance: 'ZeroBalance'
 *
 * @category Errors
 * @category generated
 */
export class ZeroBalanceError extends Error {
  readonly code: number = 0x1792
  readonly name: string = 'ZeroBalance'
  constructor() {
    super('ZeroBalance')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ZeroBalanceError)
    }
  }
}

createErrorFromCodeLookup.set(0x1792, () => new ZeroBalanceError())
createErrorFromNameLookup.set('ZeroBalance', () => new ZeroBalanceError())

/**
 * ZeroInitialDeposit: 'ZeroInitialDeposit'
 *
 * @category Errors
 * @category generated
 */
export class ZeroInitialDepositError extends Error {
  readonly code: number = 0x1793
  readonly name: string = 'ZeroInitialDeposit'
  constructor() {
    super('ZeroInitialDeposit')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ZeroInitialDepositError)
    }
  }
}

createErrorFromCodeLookup.set(0x1793, () => new ZeroInitialDepositError())
createErrorFromNameLookup.set(
  'ZeroInitialDeposit',
  () => new ZeroInitialDepositError()
)

/**
 * InvalidLpTokenDecimals: 'InvalidLpTokenDecimals'
 *
 * @category Errors
 * @category generated
 */
export class InvalidLpTokenDecimalsError extends Error {
  readonly code: number = 0x1794
  readonly name: string = 'InvalidLpTokenDecimals'
  constructor() {
    super('InvalidLpTokenDecimals')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidLpTokenDecimalsError)
    }
  }
}

createErrorFromCodeLookup.set(0x1794, () => new InvalidLpTokenDecimalsError())
createErrorFromNameLookup.set(
  'InvalidLpTokenDecimals',
  () => new InvalidLpTokenDecimalsError()
)

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
export function errorFromCode(code: number): MaybeErrorWithCode {
  const createError = createErrorFromCodeLookup.get(code)
  return createError != null ? createError() : null
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
export function errorFromName(name: string): MaybeErrorWithCode {
  const createError = createErrorFromNameLookup.get(name)
  return createError != null ? createError() : null
}
