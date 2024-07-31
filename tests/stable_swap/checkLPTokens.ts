import BN from 'bn.js';
import calculateLPTokens from "./calculateLPTokens";

export type PoolState = {
    totalSupply: BN;
    reserves: BN[];
    amplificationCoefficient: BN;
}

// Function to check if received LP tokens are correct
export default function checkLPTokens(
    receivedLPTokens: BN,
    amountsIn: BN[],
    poolState: PoolState,
    tolerance: number = 0.001
): boolean {
    const expectedLPTokens = calculateLPTokens(amountsIn, poolState);
    const difference = receivedLPTokens.sub(expectedLPTokens).abs();
    const relativeError = difference.mul(new BN(1000)).div(expectedLPTokens);

    return relativeError.lte(new BN(Math.floor(tolerance * 1000)));
}