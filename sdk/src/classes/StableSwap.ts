import BN from "bn.js";

// Constants
export const MIN_AMP = new BN(1);
export const MAX_AMP = new BN(1_000_000);
export const MAX_ITERATIONS = 255;
export const PRECISION = new BN(1_000_000_000);
export const ZERO = new BN(0);
export const ONE = new BN(1);
export const TWO = new BN(2);

// Enums
export enum StableSwapMode {
    BINARY = "BINARY", // only 2 tokens
    MULTI = "MULTI"    // up to 8 tokens are supported
}

// Interfaces
export interface SwapOut {
    outAmount: BN;
}

export interface SwapIn {
    inAmount: BN;
}

export class StableSwap {
    private amp: BN;
    private nTokens: BN;
    private mode: StableSwapMode;

    constructor(amp: BN, nTokens: BN) {
        if (amp.lt(MIN_AMP) || amp.gt(MAX_AMP)) {
            throw new Error("Amplification coefficient out of bound");
        }

        if (nTokens.lt(TWO) || nTokens.gt(new BN(8))) {
            throw new Error("Pool tokens count out of bound");
        }

        this.amp = amp;
        this.nTokens = nTokens;
        this.mode = nTokens.gt(TWO) ? StableSwapMode.MULTI : StableSwapMode.BINARY;
    }

    static newBinary(amp: BN): StableSwap {
        return new StableSwap(amp, TWO);
    }

    getAmp(): BN {
        return this.amp;
    }

    addToken(): void {
        this.nTokens = this.nTokens.add(ONE);
    }

    removeToken(): void {
        this.nTokens = this.nTokens.sub(ONE);
    }

    private computeDNext(
        dPrev: BN,
        n: BN,
        nn: BN,
        balances: BN[],
        annSum: BN,
        annMinusOne: BN,
        nPlusOne: BN
    ): BN {
        let dProd = dPrev;

        for (const balance of balances) {
            dProd = dProd.mul(dPrev).div(balance);
        }

        dProd = dProd.div(nn);

        const numerator = dPrev.mul(dProd.mul(n).add(annSum));
        const denominator = dPrev.mul(annMinusOne).add(dProd.mul(nPlusOne));

        return numerator.div(denominator);
    }

    computeD(balances: BN[]): BN {
        const sum = balances.reduce((acc, bal) => acc.add(bal), ZERO);

        if (sum.eq(ZERO)) {
            return ZERO;
        }

        const n = new BN(balances.length);
        const nn = n.pow(n);
        const ann = this.amp.mul(nn);
        const annSum = ann.mul(sum);
        const annMinusOne = ann.sub(ONE);
        const nPlusOne = n.add(ONE);

        let d = sum;

        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const dNext = this.computeDNext(
                d,
                n,
                nn,
                balances,
                annSum,
                annMinusOne,
                nPlusOne
            );

            if (this.absDiff(dNext, d).lte(ONE)) {
                return d;
            }

            d = dNext;
        }

        throw new Error("Invariant precision not found");
    }

    computeY(
        balances: BN[],
        i: number,
        j: number,
        newJBalance: BN
    ): BN {
        const nBalances = new BN(balances.length);
        const nn = nBalances.pow(nBalances);
        const ann = this.amp.mul(nn);
        const d = this.computeD(balances);

        let c = d.mul(d).div(newJBalance);
        let sum = newJBalance;

        for (let k = 0; k < balances.length; k++) {
            if (k !== i && k !== j) {
                c = c.mul(d).div(balances[k]);
                sum = sum.add(balances[k]);
            }
        }

        c = c.mul(d).div(ann.mul(nBalances));
        const b = sum.add(d.div(ann));

        let yPrev = d;
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const y = this.computeYNext(yPrev, b, c, d);

            if (this.absDiff(y, yPrev).lte(ONE)) {
                return y;
            }

            yPrev = y;
        }

        throw new Error("Invariant precision not found");
    }

    private computeYNext(
        yPrev: BN,
        b: BN,
        c: BN,
        d: BN
    ): BN {
        const yPrevSquared = yPrev.mul(yPrev);
        const numerator = yPrevSquared.add(c);
        const denominator = yPrev.mul(TWO).add(b).sub(d);
        return numerator.div(denominator);
    }

    swapExactIn(
        balances: BN[],
        from: number,
        to: number,
        fromAmount: BN
    ): SwapOut {
        const newFrom = balances[from].add(fromAmount);
        const y = this.computeY(balances, to, from, newFrom);
        const dy = balances[to].sub(y).sub(ONE);

        return {
            outAmount: dy
        };
    }

    swapExactOut(
        balances: BN[],
        inId: number,
        outId: number,
        outAmount: BN
    ): SwapIn {
        const y = this.computeY(
            balances,
            inId,
            outId,
            balances[outId].sub(outAmount)
        );

        const dy = y.sub(balances[inId]);

        return {
            inAmount: dy
        };
    }

    getVirtualPrice(
        balances: BN[],
        lpTokenSupply: BN
    ): BN {
        const d = this.computeD(balances);
        const n = new BN(balances.length);
        return d.mul(PRECISION).div(n).div(lpTokenSupply);
    }

    getSpotPrice(
        balances: BN[],
        from: number,
        to: number,
        fromAmount: BN
    ): BN {
        const { outAmount } = this.swapExactIn(balances, from, to, fromAmount);
        return fromAmount.div(outAmount);
    }

    computeLpTokensOnDeposit(
        depositId: number,
        depositAmount: BN,
        balances: BN[],
        lpTokenSupply: BN
    ): BN {
        if (lpTokenSupply.eq(ZERO)) {
            const newBalances = [...balances];
            newBalances[depositId] = newBalances[depositId].add(depositAmount);
            return this.computeD(newBalances);
        }

        const currentD = this.computeD(balances);
        const newBalances = [...balances];
        newBalances[depositId] = depositAmount;
        const newD = this.computeD(newBalances);

        return lpTokenSupply.mul(newD.sub(currentD)).div(currentD);
    }

    computeLpTokensOnWithdrawal(
        withdrawalId: number,
        withdrawalAmount: BN,
        balances: BN[],
        lpTokenSupply: BN
    ): BN {
        const currentD = this.computeD(balances);
        const newBalances = [...balances];
        newBalances[withdrawalId] = newBalances[withdrawalId].sub(withdrawalAmount);
        const newD = this.computeD(newBalances);

        return lpTokenSupply.mul(currentD.sub(newD)).div(currentD);
    }

    computeTokensOnWithdrawal(
        balances: BN[],
        lpTokenSupply: BN,
        lpTokenWithdrawal: BN
    ): BN[] {
        const BPS = new BN(10_000);
        const totalPoolShareBps = lpTokenWithdrawal.mul(BPS).div(lpTokenSupply);
        return balances.map(balance =>
            balance.mul(totalPoolShareBps).div(BPS)
        );
    }

    computeLpTokensOnDepositMulti(
        deposits: BN[],
        balances: BN[],
        lpTokenSupply: BN
    ): BN {
        if (deposits.length !== balances.length) {
            throw new Error("Invalid input length");
        }

        if (lpTokenSupply.eq(ZERO)) {
            const newBalances = balances.map((balance, i) =>
                balance.add(deposits[i])
            );
            return this.computeD(newBalances);
        }

        const currentD = this.computeD(balances);
        const newBalances = balances.map((balance, i) =>
            balance.add(deposits[i])
        );
        const newD = this.computeD(newBalances);

        return lpTokenSupply.mul(newD.sub(currentD)).div(currentD);
    }

    private absDiff(a: BN, b: BN): BN {
        return a.gt(b) ? a.sub(b) : b.sub(a);
    }
}