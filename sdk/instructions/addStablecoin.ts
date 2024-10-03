/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category AddStablecoin
 * @category generated
 */
export const addStablecoinStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'AddStablecoinInstructionArgs'
)
/**
 * Accounts required by the _addStablecoin_ instruction
 *
 * @property [_writable_, **signer**] superadmin
 * @property [_writable_] core
 * @property [_writable_] stablecoin
 * @category Instructions
 * @category AddStablecoin
 * @category generated
 */
export type AddStablecoinInstructionAccounts = {
  superadmin: web3.PublicKey
  core: web3.PublicKey
  stablecoin: web3.PublicKey
  rent?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addStablecoinInstructionDiscriminator = [
  184, 160, 218, 168, 41, 5, 46, 54,
]

/**
 * Creates a _AddStablecoin_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category AddStablecoin
 * @category generated
 */
export function createAddStablecoinInstruction(
  accounts: AddStablecoinInstructionAccounts,
  programId = new web3.PublicKey('AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n')
) {
  const [data] = addStablecoinStruct.serialize({
    instructionDiscriminator: addStablecoinInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.superadmin,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.core,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stablecoin,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
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