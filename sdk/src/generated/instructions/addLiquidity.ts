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
  AddLiquidityArgs,
  addLiquidityArgsBeet,
} from '../types/AddLiquidityArgs'

/**
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export type AddLiquidityInstructionArgs = {
  args: AddLiquidityArgs
}
/**
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export const addLiquidityStruct = new beet.FixableBeetArgsStruct<
  AddLiquidityInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', addLiquidityArgsBeet],
  ],
  'AddLiquidityInstructionArgs'
)
/**
 * Accounts required by the _addLiquidity_ instruction
 *
 * @property [_writable_, **signer**] user
 * @property [_writable_] core
 * @property [_writable_] pool
 * @property [_writable_] lpToken
 * @property [_writable_] lpTokenUserAta
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export type AddLiquidityInstructionAccounts = {
  user: web3.PublicKey
  core: web3.PublicKey
  pool: web3.PublicKey
  lpToken: web3.PublicKey
  lpTokenUserAta: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addLiquidityInstructionDiscriminator = [
  181, 157, 89, 67, 143, 182, 52, 72,
]

/**
 * Creates a _AddLiquidity_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export function createAddLiquidityInstruction(
  accounts: AddLiquidityInstructionAccounts,
  args: AddLiquidityInstructionArgs,
  programId = new web3.PublicKey('HTHyAbn3YXReoNWRczVasQkocnbXB4TASkjMpHrEGS9Q')
) {
  const [data] = addLiquidityStruct.serialize({
    instructionDiscriminator: addLiquidityInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.user,
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
      pubkey: accounts.lpTokenUserAta,
      isWritable: true,
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
