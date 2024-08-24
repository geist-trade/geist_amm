import BN from "bn.js";
import calculateInvariant from "./calculateInvariant";

export default function calculateLPTokens(
    balances: BN[],
    deposits: BN[],
    amp: BN,
    lpTokenSupply: BN
) {
    if (balances.length !== deposits.length) {
        throw new Error("InvalidInput");
    }

    if (lpTokenSupply.eq(new BN((0)))) {
        const newBalances = balances.map((balance, index) => {
            let deposit = deposits[index];
            return balance.add(deposit);
        });

        let lpTokens = calculateInvariant(
            newBalances,
            amp
        );

        return lpTokens;
    }

    const currentInvariant = calculateInvariant(
        balances,
        amp
    );

    const newBalances = balances.map((balance, index) => {
        let deposit = deposits[index];
        return balance.add(deposit);
    });

    const newInvariant = calculateInvariant(newBalances, amp);

    let lpTokens = lpTokenSupply
        .mul(newInvariant.sub(currentInvariant))
        .div(currentInvariant);

    return lpTokens;
}