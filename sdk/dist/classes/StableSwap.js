"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StableSwap = exports.StableSwapMode = exports.TWO = exports.ONE = exports.ZERO = exports.PRECISION = exports.MAX_ITERATIONS = exports.MAX_AMP = exports.MIN_AMP = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
// Constants
exports.MIN_AMP = new bn_js_1.default(1);
exports.MAX_AMP = new bn_js_1.default(1000000);
exports.MAX_ITERATIONS = 255;
exports.PRECISION = new bn_js_1.default(1000000000);
exports.ZERO = new bn_js_1.default(0);
exports.ONE = new bn_js_1.default(1);
exports.TWO = new bn_js_1.default(2);
// Enums
var StableSwapMode;
(function (StableSwapMode) {
    StableSwapMode["BINARY"] = "BINARY";
    StableSwapMode["MULTI"] = "MULTI"; // up to 8 tokens are supported
})(StableSwapMode || (exports.StableSwapMode = StableSwapMode = {}));
class StableSwap {
    constructor(amp, nTokens) {
        if (amp.lt(exports.MIN_AMP) || amp.gt(exports.MAX_AMP)) {
            throw new Error("Amplification coefficient out of bound");
        }
        if (nTokens.lt(exports.TWO) || nTokens.gt(new bn_js_1.default(8))) {
            throw new Error("Pool tokens count out of bound");
        }
        this.amp = amp;
        this.nTokens = nTokens;
        this.mode = nTokens.gt(exports.TWO) ? StableSwapMode.MULTI : StableSwapMode.BINARY;
    }
    static newBinary(amp) {
        return new StableSwap(amp, exports.TWO);
    }
    getAmp() {
        return this.amp;
    }
    addToken() {
        this.nTokens = this.nTokens.add(exports.ONE);
    }
    removeToken() {
        this.nTokens = this.nTokens.sub(exports.ONE);
    }
    computeDNext(dPrev, n, nn, balances, annSum, annMinusOne, nPlusOne) {
        let dProd = dPrev;
        for (const balance of balances) {
            dProd = dProd.mul(dPrev).div(balance);
        }
        dProd = dProd.div(nn);
        const numerator = dPrev.mul(dProd.mul(n).add(annSum));
        const denominator = dPrev.mul(annMinusOne).add(dProd.mul(nPlusOne));
        return numerator.div(denominator);
    }
    computeD(balances) {
        const sum = balances.reduce((acc, bal) => acc.add(bal), exports.ZERO);
        if (sum.eq(exports.ZERO)) {
            return exports.ZERO;
        }
        const n = new bn_js_1.default(balances.length);
        const nn = n.pow(n);
        const ann = this.amp.mul(nn);
        const annSum = ann.mul(sum);
        const annMinusOne = ann.sub(exports.ONE);
        const nPlusOne = n.add(exports.ONE);
        let d = sum;
        for (let i = 0; i < exports.MAX_ITERATIONS; i++) {
            const dNext = this.computeDNext(d, n, nn, balances, annSum, annMinusOne, nPlusOne);
            if (this.absDiff(dNext, d).lte(exports.ONE)) {
                return d;
            }
            d = dNext;
        }
        throw new Error("Invariant precision not found");
    }
    computeY(balances, i, j, newJBalance) {
        const nBalances = new bn_js_1.default(balances.length);
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
        for (let i = 0; i < exports.MAX_ITERATIONS; i++) {
            const y = this.computeYNext(yPrev, b, c, d);
            if (this.absDiff(y, yPrev).lte(exports.ONE)) {
                return y;
            }
            yPrev = y;
        }
        throw new Error("Invariant precision not found");
    }
    computeYNext(yPrev, b, c, d) {
        const yPrevSquared = yPrev.mul(yPrev);
        const numerator = yPrevSquared.add(c);
        const denominator = yPrev.mul(exports.TWO).add(b).sub(d);
        return numerator.div(denominator);
    }
    swapExactIn(balances, from, to, fromAmount) {
        const newFrom = balances[from].add(fromAmount);
        const y = this.computeY(balances, to, from, newFrom);
        const dy = balances[to].sub(y).sub(exports.ONE);
        return {
            outAmount: dy
        };
    }
    swapExactOut(balances, inId, outId, outAmount) {
        const y = this.computeY(balances, inId, outId, balances[outId].sub(outAmount));
        const dy = y.sub(balances[inId]);
        return {
            inAmount: dy
        };
    }
    getVirtualPrice(balances, lpTokenSupply) {
        const d = this.computeD(balances);
        const n = new bn_js_1.default(balances.length);
        return d.mul(exports.PRECISION).div(n).div(lpTokenSupply);
    }
    getSpotPrice(balances, from, to, fromAmount) {
        const { outAmount } = this.swapExactIn(balances, from, to, fromAmount);
        return fromAmount.div(outAmount);
    }
    computeLpTokensOnDeposit(depositId, depositAmount, balances, lpTokenSupply) {
        if (lpTokenSupply.eq(exports.ZERO)) {
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
    computeLpTokensOnWithdrawal(withdrawalId, withdrawalAmount, balances, lpTokenSupply) {
        const currentD = this.computeD(balances);
        const newBalances = [...balances];
        newBalances[withdrawalId] = newBalances[withdrawalId].sub(withdrawalAmount);
        const newD = this.computeD(newBalances);
        return lpTokenSupply.mul(currentD.sub(newD)).div(currentD);
    }
    computeTokensOnWithdrawal(balances, lpTokenSupply, lpTokenWithdrawal) {
        const BPS = new bn_js_1.default(10000);
        const totalPoolShareBps = lpTokenWithdrawal.mul(BPS).div(lpTokenSupply);
        return balances.map(balance => balance.mul(totalPoolShareBps).div(BPS));
    }
    computeLpTokensOnDepositMulti(deposits, balances, lpTokenSupply) {
        if (deposits.length !== balances.length) {
            throw new Error("Invalid input length");
        }
        if (lpTokenSupply.eq(exports.ZERO)) {
            const newBalances = balances.map((balance, i) => balance.add(deposits[i]));
            return this.computeD(newBalances);
        }
        const currentD = this.computeD(balances);
        const newBalances = balances.map((balance, i) => balance.add(deposits[i]));
        const newD = this.computeD(newBalances);
        return lpTokenSupply.mul(newD.sub(currentD)).div(currentD);
    }
    absDiff(a, b) {
        return a.gt(b) ? a.sub(b) : b.sub(a);
    }
}
exports.StableSwap = StableSwap;
