import BN from "bn.js";

export default function parseBn(
    input: BN | number
) {
    if (typeof input === 'number') {
        return input;
    } else {
        return input.toNumber();
    }
}