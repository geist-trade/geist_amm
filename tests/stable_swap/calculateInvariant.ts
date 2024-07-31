import BN from "bn.js";

export default function calculateInvariant(
    balances: BN[],
    amplificationCoefficient: BN
): BN {
    const n = balances.length;
    const sum = balances.reduce((acc, balance) => acc.add(balance), new BN(0));

    if (sum.isZero()) {
        return new BN(0);
    }

    let D = sum;
    const Ann = amplificationCoefficient.mul(new BN(n));

    for (let i = 0; i < 255; i++) {
        let D_P = new BN(D);
        for (const balance of balances) {
            D_P = D_P.mul(D).div(balance.mul(new BN(n)));
        }
        const prevD = D;
        D = Ann.mul(sum).add(D_P.mul(new BN(n)))
            .mul(D)
            .div(Ann.sub(new BN(1)).mul(D).add(D_P.mul(new BN(n + 1))));

        if (D.sub(prevD).abs().lte(new BN(1))) {
            return D;
        }
    }

    throw new Error('Invariant calculation did not converge');
}