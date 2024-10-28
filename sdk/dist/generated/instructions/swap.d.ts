/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { SwapArgs } from '../types/SwapArgs';
/**
 * @category Instructions
 * @category Swap
 * @category generated
 */
export type SwapInstructionArgs = {
    args: SwapArgs;
};
/**
 * @category Instructions
 * @category Swap
 * @category generated
 */
export declare const swapStruct: beet.FixableBeetArgsStruct<SwapInstructionArgs & {
    instructionDiscriminator: number[];
}>;
/**
 * Accounts required by the _swap_ instruction
 *
 * @property [_writable_, **signer**] user
 * @property [_writable_] core
 * @property [_writable_] pool
 * @property [_writable_] stablecoinInput
 * @property [_writable_] stablecoinOutput
 * @property [_writable_] stablecoinInputVault
 * @property [_writable_] stablecoinOutputVault
 * @property [_writable_] stablecoinInputUserAta
 * @property [_writable_] stablecoinOutputUserAta
 * @category Instructions
 * @category Swap
 * @category generated
 */
export type SwapInstructionAccounts = {
    user: web3.PublicKey;
    core: web3.PublicKey;
    pool: web3.PublicKey;
    stablecoinInput: web3.PublicKey;
    stablecoinOutput: web3.PublicKey;
    stablecoinInputVault: web3.PublicKey;
    stablecoinOutputVault: web3.PublicKey;
    stablecoinInputUserAta: web3.PublicKey;
    stablecoinOutputUserAta: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const swapInstructionDiscriminator: number[];
/**
 * Creates a _Swap_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Swap
 * @category generated
 */
export declare function createSwapInstruction(accounts: SwapInstructionAccounts, args: SwapInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
