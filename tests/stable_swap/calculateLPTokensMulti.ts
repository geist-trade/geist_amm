import BN from 'bn.js';
import calculateInvariant from "./calculateInvariant";

class GeistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeistError';
    }
}

export function calculateLPTokensMulti(
    balances: BN[],
    deposits: BN[],
    amp: BN,
    lpTokenSupply: BN
): BN {

    if (deposits.length !== balances.length) {
        throw new GeistError('InvalidInputLength');
    }

    // If it's the first deposit in the pool
    if (lpTokenSupply.isZero()) {
        const newBalances = balances.map((balance, index) =>
            balance.add(deposits[index])
        );

        const lpTokens = calculateInvariant(newBalances, amp);
        return lpTokens;
    }

    const currentD = calculateInvariant(balances, amp);

    const newBalances = balances.map((balance, index) =>
        balance.add(deposits[index])
    );

    const newD = calculateInvariant(newBalances, amp);

    if (currentD.isZero()) {
        throw new GeistError('DivisionByZero');
    }

    const lpTokens = lpTokenSupply
        .mul(newD.sub(currentD))
        .div(currentD);
    return lpTokens;
}