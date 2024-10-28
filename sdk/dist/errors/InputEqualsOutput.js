class InputEqualsOutput extends Error {
    constructor() {
        super("Input and output stablecoins cannot be the same.");
        Object.setPrototypeOf(this, StablecoinNotSupportedError.prototype);
    }
}
