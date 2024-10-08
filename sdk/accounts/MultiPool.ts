/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { StableSwap, stableSwapBeet } from '../types/StableSwap'
import { Fees, feesBeet } from '../types/Fees'

/**
 * Arguments used to create {@link MultiPool}
 * @category Accounts
 * @category generated
 */
export type MultiPoolArgs = {
  index: beet.bignum
  bump: number
  admin: web3.PublicKey
  stablecoins: web3.PublicKey[]
  amp: beet.bignum
  isFrozen: boolean
  lpToken: web3.PublicKey
  swap: StableSwap
  fees: Fees
}

export const multiPoolDiscriminator = [244, 223, 68, 238, 85, 162, 221, 210]
/**
 * Holds the data for the {@link MultiPool} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class MultiPool implements MultiPoolArgs {
  private constructor(
    readonly index: beet.bignum,
    readonly bump: number,
    readonly admin: web3.PublicKey,
    readonly stablecoins: web3.PublicKey[],
    readonly amp: beet.bignum,
    readonly isFrozen: boolean,
    readonly lpToken: web3.PublicKey,
    readonly swap: StableSwap,
    readonly fees: Fees
  ) {}

  /**
   * Creates a {@link MultiPool} instance from the provided args.
   */
  static fromArgs(args: MultiPoolArgs) {
    return new MultiPool(
      args.index,
      args.bump,
      args.admin,
      args.stablecoins,
      args.amp,
      args.isFrozen,
      args.lpToken,
      args.swap,
      args.fees
    )
  }

  /**
   * Deserializes the {@link MultiPool} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [MultiPool, number] {
    return MultiPool.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link MultiPool} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<MultiPool> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find MultiPool account at ${address}`)
    }
    return MultiPool.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, multiPoolBeet)
  }

  /**
   * Deserializes the {@link MultiPool} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [MultiPool, number] {
    return multiPoolBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link MultiPool} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return multiPoolBeet.serialize({
      accountDiscriminator: multiPoolDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link MultiPool} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: MultiPoolArgs) {
    const instance = MultiPool.fromArgs(args)
    return multiPoolBeet.toFixedFromValue({
      accountDiscriminator: multiPoolDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link MultiPool} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: MultiPoolArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      MultiPool.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link MultiPool} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      index: (() => {
        const x = <{ toNumber: () => number }>this.index
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      bump: this.bump,
      admin: this.admin.toBase58(),
      stablecoins: this.stablecoins,
      amp: (() => {
        const x = <{ toNumber: () => number }>this.amp
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      isFrozen: this.isFrozen,
      lpToken: this.lpToken.toBase58(),
      swap: this.swap,
      fees: this.fees,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const multiPoolBeet = new beet.FixableBeetStruct<
  MultiPool,
  MultiPoolArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['index', beet.u64],
    ['bump', beet.u8],
    ['admin', beetSolana.publicKey],
    ['stablecoins', beet.array(beetSolana.publicKey)],
    ['amp', beet.u64],
    ['isFrozen', beet.bool],
    ['lpToken', beetSolana.publicKey],
    ['swap', stableSwapBeet],
    ['fees', feesBeet],
  ],
  MultiPool.fromArgs,
  'MultiPool'
)
