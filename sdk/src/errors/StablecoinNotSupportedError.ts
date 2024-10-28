class StablecoinNotSupportedError extends Error {
    constructor() {
        super("Selected pool does not support this stablecoin.");
        Object.setPrototypeOf(this, StablecoinNotSupportedError.prototype);
    }
}