import BN from "bn.js";
export default class SimulatedPool {
    private stableSwap;
    private balances;
    constructor(amp: BN, balances: BN[]);
    simulateSwapExactIn(input: number, output: number, amount: BN): import("./StableSwap").SwapOut;
    simulateSwapExactOut(input: number, output: number, outAmount: BN): import("./StableSwap").SwapIn;
    simulateAddLiquidity(deposits: BN[], lpTokenSupply: BN): BN;
    simulateWithdrawLiquidity(lpTokenSupply: BN, lpTokenWithdrawal: BN): BN[];
}
