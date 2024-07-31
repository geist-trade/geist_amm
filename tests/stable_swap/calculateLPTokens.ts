import BN from "bn.js";
import {PoolState} from "./checkLPTokens";
import calculateInvariant from "./calculateInvariant";

export default function calculateLPTokens(
    amountsIn: BN[],
    poolState: PoolState
): BN {
    const { totalSupply, reserves, amplificationCoefficient } = poolState;
    const n = reserves.length;

    // Calculate the invariant D before adding liquidity
    const D0 = calculateInvariant(reserves, amplificationCoefficient);

    // Handle the case where the pool is empty (D0 = 0)
    if (D0.isZero()) {
        // For an empty pool, mint LP tokens equal to compute_d(amountsIn, amplificationCoefficient)
        return calculateInvariant(amountsIn, amplificationCoefficient);
    }

    // Calculate new balances after adding liquidity
    const newBalances = reserves.map((reserve, i) => reserve.add(amountsIn[i]));

    // Calculate the invariant D after adding liquidity
    const D1 = calculateInvariant(newBalances, amplificationCoefficient);

    // Calculate the amount of LP tokens to mint
    const mintAmount = totalSupply.mul(D1.sub(D0)).div(D0);

    return mintAmount;
}