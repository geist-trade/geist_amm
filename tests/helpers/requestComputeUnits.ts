import {ComputeBudgetInstruction, ComputeBudgetProgram} from "@solana/web3.js";

export default function requestComputeUnits(units: number) {
    return ComputeBudgetProgram.setComputeUnitLimit({
        units
    });
}