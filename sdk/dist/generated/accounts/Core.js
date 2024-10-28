"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreBeet = exports.Core = exports.coreDiscriminator = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.coreDiscriminator = [90, 167, 99, 154, 192, 227, 13, 62];
/**
 * Holds the data for the {@link Core} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
class Core {
    constructor(nextPoolId, superadmin, platformFeeBps, supportedStablecoins, withdrawOnlyStablecoins, isFrozen) {
        this.nextPoolId = nextPoolId;
        this.superadmin = superadmin;
        this.platformFeeBps = platformFeeBps;
        this.supportedStablecoins = supportedStablecoins;
        this.withdrawOnlyStablecoins = withdrawOnlyStablecoins;
        this.isFrozen = isFrozen;
    }
    /**
     * Creates a {@link Core} instance from the provided args.
     */
    static fromArgs(args) {
        return new Core(args.nextPoolId, args.superadmin, args.platformFeeBps, args.supportedStablecoins, args.withdrawOnlyStablecoins, args.isFrozen);
    }
    /**
     * Deserializes the {@link Core} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo, offset = 0) {
        return Core.deserialize(accountInfo.data, offset);
    }
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link Core} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection, address, commitmentOrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address, commitmentOrConfig);
            if (accountInfo == null) {
                throw new Error(`Unable to find Core account at ${address}`);
            }
            return Core.fromAccountInfo(accountInfo, 0)[0];
        });
    }
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId = new web3.PublicKey('AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.coreBeet);
    }
    /**
     * Deserializes the {@link Core} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf, offset = 0) {
        return exports.coreBeet.deserialize(buf, offset);
    }
    /**
     * Serializes the {@link Core} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize() {
        return exports.coreBeet.serialize(Object.assign({ accountDiscriminator: exports.coreDiscriminator }, this));
    }
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link Core} for the provided args.
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     */
    static byteSize(args) {
        const instance = Core.fromArgs(args);
        return exports.coreBeet.toFixedFromValue(Object.assign({ accountDiscriminator: exports.coreDiscriminator }, instance)).byteSize;
    }
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link Core} data from rent
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(args, connection, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return connection.getMinimumBalanceForRentExemption(Core.byteSize(args), commitment);
        });
    }
    /**
     * Returns a readable version of {@link Core} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty() {
        return {
            nextPoolId: (() => {
                const x = this.nextPoolId;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            superadmin: this.superadmin.toBase58(),
            platformFeeBps: (() => {
                const x = this.platformFeeBps;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            supportedStablecoins: this.supportedStablecoins,
            withdrawOnlyStablecoins: this.withdrawOnlyStablecoins,
            isFrozen: this.isFrozen,
        };
    }
}
exports.Core = Core;
/**
 * @category Accounts
 * @category generated
 */
exports.coreBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['nextPoolId', beet.u64],
    ['superadmin', beetSolana.publicKey],
    ['platformFeeBps', beet.u64],
    ['supportedStablecoins', beet.array(beetSolana.publicKey)],
    ['withdrawOnlyStablecoins', beet.array(beetSolana.publicKey)],
    ['isFrozen', beet.bool],
], Core.fromArgs, 'Core');
