import BN from "bn.js";

function computeDNext(
    dPrev: BN,
    n: number,
    nn: BN,
    balances: BN[],
    annSum: BN,
    annMinusOne: BN,
    nPlusOne: BN
): BN {
    let dProd = new BN(1);
    let nActual = n;

    for (const balance of balances) {
        if (balance.isZero()) {
            nActual--;
            continue;
        }
        dProd = dProd.mul(dPrev).div(balance.mul(new BN(n)));
    }

    if (nActual === 0) {
        return new BN(0);
    }

    const numerator = annSum.mul(dPrev).add(dProd.mul(nn).mul(new BN(nActual)));
    const denominator = annMinusOne.mul(dPrev).add(dProd.mul(nPlusOne).mul(new BN(nActual)));

    return numerator.div(denominator);
}

export default function calculateInvariant(balances: BN[], amp: BN): BN {
    const sum = balances.reduce((acc, bal) => acc.add(bal), new BN(0));

    if (sum.isZero()) {
        return new BN(0);
    }

    const n = balances.length;
    const nn = Math.pow(n, n);
    const ann = amp.mul(new BN(nn));

    const annSum = ann.mul(sum);
    const annMinusOne = ann.sub(new BN(1));
    const nPlusOne = n + 1;

    let D = sum;

    for (let i = 0; i < 255; i++) {
        const dNext = computeDNext(
            D,
            n,
            new BN(nn),
            balances,
            annSum,
            annMinusOne,
            new BN(nPlusOne)
        );

        if (dNext.isZero() || D.sub(dNext).abs().lte(new BN(1))) {
            return D;
        }

        D = dNext;
    }

    throw new Error("InvariantPrecisionNotFound");
}