import BN from "bn.js";
export declare const MIN_AMP: BN;
export declare const MAX_AMP: BN;
export declare const MAX_ITERATIONS = 255;
export declare const PRECISION: BN;
export declare const ZERO: BN;
export declare const ONE: BN;
export declare const TWO: BN;
export declare enum StableSwapMode {
    BINARY = "BINARY",// only 2 tokens
    MULTI = "MULTI"
}
export interface SwapOut {
    outAmount: BN;
}
export interface SwapIn {
    inAmount: BN;
}
export declare class StableSwap {
    private amp;
    private nTokens;
    private mode;
    constructor(amp: BN, nTokens: BN);
    static newBinary(amp: BN): StableSwap;
    getAmp(): BN;
    addToken(): void;
    removeToken(): void;
    private computeDNext;
    computeD(balances: BN[]): BN;
    computeY(balances: BN[], i: number, j: number, newJBalance: BN): BN;
    private computeYNext;
    swapExactIn(balances: BN[], from: number, to: number, fromAmount: BN): SwapOut;
    swapExactOut(balances: BN[], inId: number, outId: number, outAmount: BN): SwapIn;
    getVirtualPrice(balances: BN[], lpTokenSupply: BN): BN;
    getSpotPrice(balances: BN[], from: number, to: number, fromAmount: BN): BN;
    computeLpTokensOnDeposit(depositId: number, depositAmount: BN, balances: BN[], lpTokenSupply: BN): BN;
    computeLpTokensOnWithdrawal(withdrawalId: number, withdrawalAmount: BN, balances: BN[], lpTokenSupply: BN): BN;
    computeTokensOnWithdrawal(balances: BN[], lpTokenSupply: BN, lpTokenWithdrawal: BN): BN[];
    computeLpTokensOnDepositMulti(deposits: BN[], balances: BN[], lpTokenSupply: BN): BN;
    private absDiff;
}
