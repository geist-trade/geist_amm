"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StableSwap_1 = require("./StableSwap");
const bn_js_1 = __importDefault(require("bn.js"));
class SimulatedPool {
    constructor(amp, balances) {
        this.stableSwap = new StableSwap_1.StableSwap(amp, new bn_js_1.default(balances.length));
    }
    simulateSwapExactIn(input, output, amount) {
        return this.stableSwap.swapExactIn(this.balances, input, output, amount);
    }
    simulateSwapExactOut(input, output, outAmount) {
        return this.stableSwap.swapExactOut(this.balances, input, output, outAmount);
    }
}
exports.default = SimulatedPool;
