/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
import * as beet from '@metaplex-foundation/beet';
import { SwapMode } from './SwapMode';
export type SwapArgs = {
    poolId: beet.bignum;
    fromId: number;
    toId: number;
    amount: beet.bignum;
    mode: SwapMode;
};
/**
 * @category userTypes
 * @category generated
 */
export declare const swapArgsBeet: beet.FixableBeetArgsStruct<SwapArgs>;