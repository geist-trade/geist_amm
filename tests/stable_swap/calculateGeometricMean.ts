import BN from "bn.js";

export default function calculateGeometricMean(amounts: BN[]): BN {
    if (amounts.length === 0) {
        return new BN(0);
    }

    // For simplicity, we'll use integer arithmetic and take the nth root at the end
    let product = new BN(1);
    for (const amount of amounts) {
        product = product.mul(amount);
    }

    // Approximate the nth root using Newton's method
    let x = product;
    const n = new BN(amounts.length);
    for (let i = 0; i < 255; i++) {
        const nx = x.mul(n.sub(new BN(1))).add(product.div(x.pow(n.sub(new BN(1)))));
        x = nx.div(n);
        if (x.mul(x).gte(product) && x.pow(new BN(2)).lte(product.mul(new BN(2)))) {
            break;
        }
    }

    return x;
}