import {StableSwap} from "./StableSwap";
import BN from "bn.js";

export default class SimulatedPool {
    private stableSwap: StableSwap;
    private balances: BN[];

    constructor(
        amp: BN,
        balances: BN[]
    ) {
        this.stableSwap = new StableSwap(
            amp,
            new BN(balances.length)
        );
    }

    simulateSwapExactIn(
        input: number,
        output: number,
        amount: BN
    ) {
        return this.stableSwap.swapExactIn(
            this.balances,
            input,
            output,
            amount
        );
    }

    simulateSwapExactOut(
        input: number,
        output: number,
        outAmount: BN
    ) {
        return this.stableSwap.swapExactOut(
            this.balances,
            input,
            output,
            outAmount
        );
    }

    simulateAddLiquidity(
        deposits: BN[],
        lpTokenSupply: BN
    ) {
        return this.stableSwap.computeLpTokensOnDepositMulti(
            deposits,
            this.balances,
            lpTokenSupply
        );
    }

    simulateWithdrawLiquidity(
        lpTokenSupply: BN,
        lpTokenWithdrawal: BN
    ) {
        return this.stableSwap.computeTokensOnWithdrawal(
            this.balances,
            lpTokenSupply,
            lpTokenWithdrawal
        );
    }
}