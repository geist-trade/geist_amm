/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  InitializePoolArgs,
  initializePoolArgsBeet,
} from '../types/InitializePoolArgs'

/**
 * @category Instructions
 * @category InitializePool
 * @category generated
 */
export type InitializePoolInstructionArgs = {
  args: InitializePoolArgs
}
/**
 * @category Instructions
 * @category InitializePool
 * @category generated
 */
export const initializePoolStruct = new beet.FixableBeetArgsStruct<
  InitializePoolInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', initializePoolArgsBeet],
  ],
  'InitializePoolInstructionArgs'
)
/**
 * Accounts required by the _initializePool_ instruction
 *
 * @property [_writable_, **signer**] admin
 * @property [_writable_] core
 * @property [_writable_] pool
 * @property [_writable_] lpToken
 * @property [] lightLpTokenPool
 * @property [_writable_] lpTokenAdminAta
 * @property [] merkleTree
 * @property [] noopProgram
 * @property [] lightSystemProgram
 * @property [] accountCompressionProgram
 * @property [] compressedTokenProgram
 * @property [] lightCpiAuthority
 * @property [] lightRegisteredProgram
 * @property [] selfProgram
 * @property [] accountCompressionAuthority
 * @category Instructions
 * @category InitializePool
 * @category generated
 */
export type InitializePoolInstructionAccounts = {
  admin: web3.PublicKey
  core: web3.PublicKey
  pool: web3.PublicKey
  lpToken: web3.PublicKey
  lightLpTokenPool: web3.PublicKey
  lpTokenAdminAta: web3.PublicKey
  rent?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  merkleTree: web3.PublicKey
  noopProgram: web3.PublicKey
  lightSystemProgram: web3.PublicKey
  accountCompressionProgram: web3.PublicKey
  compressedTokenProgram: web3.PublicKey
  lightCpiAuthority: web3.PublicKey
  lightRegisteredProgram: web3.PublicKey
  selfProgram: web3.PublicKey
  accountCompressionAuthority: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializePoolInstructionDiscriminator = [
  95, 180, 10, 172, 84, 174, 232, 40,
]

/**
 * Creates a _InitializePool_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializePool
 * @category generated
 */
export function createInitializePoolInstruction(
  accounts: InitializePoolInstructionAccounts,
  args: InitializePoolInstructionArgs,
  programId = new web3.PublicKey('AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n')
) {
  const [data] = initializePoolStruct.serialize({
    instructionDiscriminator: initializePoolInstructionDiscriminator,
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
      pubkey: accounts.pool,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lpToken,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lightLpTokenPool,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.lpTokenAdminAta,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.merkleTree,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.noopProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.lightSystemProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.accountCompressionProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.compressedTokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.lightCpiAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.lightRegisteredProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.selfProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.accountCompressionAuthority,
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
