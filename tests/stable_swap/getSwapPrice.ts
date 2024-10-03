import BN from "bn.js";
import calculateInvariant from "./calculateInvariant";

function computeY(
    balances: BN[],
    i: number,
    j: number,
    newJBalance: BN,
    amp: BN
): BN {
    const nBalances = new BN(balances.length);
    const nn = nBalances.pow(nBalances);
    const ann = amp.mul(nn);
    const d = calculateInvariant(balances, amp);

    let productTerm = d.mul(d).div(newJBalance);
    let totalBalances = newJBalance;

    for (let k = 0; k < balances.length; k++) {
        if (k !== i && k !== j) {
            totalBalances = totalBalances.add(balances[k]);
            productTerm = productTerm.mul(d).div(balances[k]);
        }
    }

    productTerm = productTerm.mul(d).div(ann.mul(nBalances));
    const sumTerm = d.div(ann).add(totalBalances);

    let yPrev = d;
    for (let iteration = 0; iteration < 255; iteration++) {
        const y = computeYNext(yPrev, sumTerm, productTerm, d);
        if (y.sub(yPrev).abs().lte(new BN(1))) {
            return y;
        }
        yPrev = y;
    }

    throw new Error('InvariantPrecisionNotFound');
}

function computeYNext(
    yPrev: BN,
    b: BN,
    c: BN,
    d: BN
): BN {
    const numerator = yPrev.pow(new BN(2)).add(c);
    const denominator = yPrev.mul(new BN(2)).add(b).sub(d);
    return numerator.div(denominator);
}

export function getExactInSwapPrice(
    balances: BN[],
    from: number,
    to: number,
    fromAmount: BN,
    amp: BN
): BN {
    const newFrom = balances[from].add(fromAmount);
    const y = computeY(balances, to, from, newFrom, amp);
    const dy = balances[to].sub(y).sub(new BN(1));
    return dy;
}

export function getExactOutSwapPrice(
    balances: BN[],
    inId: number,
    outId: number,
    outAmount: BN,
    amp: BN
): BN {
    const totalOut = outAmount;
    console.log("balances:", balances.map(b => b.toString()));

    const y = computeY(
        balances,
        inId,
        outId,
        balances[outId].sub(totalOut),
        amp
    );

    console.log("y:", y.toString());

    const dy = y.sub(balances[inId]);

    console.log("dy:", dy.toString());

    return dy;
}