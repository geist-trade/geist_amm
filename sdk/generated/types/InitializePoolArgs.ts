/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { Fees, feesBeet } from './Fees'
export type InitializePoolArgs = {
  amp: beet.bignum
  nTokens: beet.bignum
  deposits: beet.bignum[]
  fees: Fees
}

/**
 * @category userTypes
 * @category generated
 */
export const initializePoolArgsBeet =
  new beet.FixableBeetArgsStruct<InitializePoolArgs>(
    [
      ['amp', beet.u64],
      ['nTokens', beet.u64],
      ['deposits', beet.array(beet.u64)],
      ['fees', feesBeet],
    ],
    'InitializePoolArgs'
  )
