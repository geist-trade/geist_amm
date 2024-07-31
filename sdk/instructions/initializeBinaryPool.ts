/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { Fees, feesBeet } from '../types/Fees'

/**
 * @category Instructions
 * @category InitializeBinaryPool
 * @category generated
 */
export type InitializeBinaryPoolInstructionArgs = {
  amp: beet.bignum
  initialDepositA: beet.bignum
  initialDepositB: beet.bignum
  fees: Fees
}
/**
 * @category Instructions
 * @category InitializeBinaryPool
 * @category generated
 */
export const initializeBinaryPoolStruct = new beet.BeetArgsStruct<
  InitializeBinaryPoolInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amp', beet.u64],
    ['initialDepositA', beet.u64],
    ['initialDepositB', beet.u64],
    ['fees', feesBeet],
  ],
  'InitializeBinaryPoolInstructionArgs'
)
/**
 * Accounts required by the _initializeBinaryPool_ instruction
 *
 * @property [_writable_, **signer**] admin
 * @property [_writable_] core
 * @property [_writable_] binaryPool
 * @property [_writable_] stablecoinA
 * @property [_writable_] stablecoinB
 * @property [_writable_] lpToken
 * @property [_writable_] lpTokenUserAta
 * @property [_writable_] stablecoinAVault
 * @property [_writable_] stablecoinBVault
 * @property [_writable_] stablecoinAAdminAta
 * @property [_writable_] stablecoinBAdminAta
 * @category Instructions
 * @category InitializeBinaryPool
 * @category generated
 */
export type InitializeBinaryPoolInstructionAccounts = {
  admin: web3.PublicKey
  core: web3.PublicKey
  binaryPool: web3.PublicKey
  stablecoinA: web3.PublicKey
  stablecoinB: web3.PublicKey
  lpToken: web3.PublicKey
  lpTokenUserAta: web3.PublicKey
  stablecoinAVault: web3.PublicKey
  stablecoinBVault: web3.PublicKey
  stablecoinAAdminAta: web3.PublicKey
  stablecoinBAdminAta: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeBinaryPoolInstructionDiscriminator = [
  93, 0, 12, 199, 10, 58, 109, 43,
]

/**
 * Creates a _InitializeBinaryPool_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeBinaryPool
 * @category generated
 */
export function createInitializeBinaryPoolInstruction(
  accounts: InitializeBinaryPoolInstructionAccounts,
  args: InitializeBinaryPoolInstructionArgs,
  programId = new web3.PublicKey('AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n')
) {
  const [data] = initializeBinaryPoolStruct.serialize({
    instructionDiscriminator: initializeBinaryPoolInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.admin,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.core,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.binaryPool,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stablecoinA,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stablecoinB,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lpToken,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lpTokenUserAta,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stablecoinAVault,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stablecoinBVault,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stablecoinAAdminAta,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stablecoinBAdminAta,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
