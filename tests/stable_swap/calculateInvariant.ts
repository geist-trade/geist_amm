import BN from "bn.js";

function computeDNext(
    dPrev: BN,
    n: number,
    nn: number,
    balances: BN[],
    annSum: BN,
    annMinusOne: BN,
    nPlusOne: number
): BN {
    let dProd = dPrev;

    for (const balance of balances) {
        dProd = dProd.mul(dPrev).div(balance);
    }

    dProd = dProd.div(new BN(nn));

    const numerator = dPrev.mul(
        dProd.mul(new BN(n)).add(annSum)
    );

    const denominator = dPrev.mul(annMinusOne).add(
        dProd.mul(new BN(nPlusOne))
    );

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
            nn,
            balances,
            annSum,
            annMinusOne,
            nPlusOne
        );

        if (D.sub(dNext).abs().lte(new BN(1))) {
            return D;
        }

        D = dNext;
    }

    throw new Error("InvariantPrecisionNotFound");
}