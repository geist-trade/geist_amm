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
exports.poolBeet = exports.Pool = exports.poolDiscriminator = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const StableSwap_1 = require("../types/StableSwap");
const Fees_1 = require("../types/Fees");
const TokenMode_1 = require("../types/TokenMode");
exports.poolDiscriminator = [241, 154, 109, 4, 17, 177, 109, 188];
/**
 * Holds the data for the {@link Pool} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
class Pool {
    constructor(index, bump, admin, stablecoins, isFrozen, lpToken, swap, fees, tokenMode) {
        this.index = index;
        this.bump = bump;
        this.admin = admin;
        this.stablecoins = stablecoins;
        this.isFrozen = isFrozen;
        this.lpToken = lpToken;
        this.swap = swap;
        this.fees = fees;
        this.tokenMode = tokenMode;
    }
    /**
     * Creates a {@link Pool} instance from the provided args.
     */
    static fromArgs(args) {
        return new Pool(args.index, args.bump, args.admin, args.stablecoins, args.isFrozen, args.lpToken, args.swap, args.fees, args.tokenMode);
    }
    /**
     * Deserializes the {@link Pool} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo, offset = 0) {
        return Pool.deserialize(accountInfo.data, offset);
    }
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link Pool} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection, address, commitmentOrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address, commitmentOrConfig);
            if (accountInfo == null) {
                throw new Error(`Unable to find Pool account at ${address}`);
            }
            return Pool.fromAccountInfo(accountInfo, 0)[0];
        });
    }
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId = new web3.PublicKey('HTHyAbn3YXReoNWRczVasQkocnbXB4TASkjMpHrEGS9Q')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.poolBeet);
    }
    /**
     * Deserializes the {@link Pool} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf, offset = 0) {
        return exports.poolBeet.deserialize(buf, offset);
    }
    /**
     * Serializes the {@link Pool} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize() {
        return exports.poolBeet.serialize(Object.assign({ accountDiscriminator: exports.poolDiscriminator }, this));
    }
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link Pool} for the provided args.
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     */
    static byteSize(args) {
        const instance = Pool.fromArgs(args);
        return exports.poolBeet.toFixedFromValue(Object.assign({ accountDiscriminator: exports.poolDiscriminator }, instance)).byteSize;
    }
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link Pool} data from rent
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(args, connection, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return connection.getMinimumBalanceForRentExemption(Pool.byteSize(args), commitment);
        });
    }
    /**
     * Returns a readable version of {@link Pool} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty() {
        return {
            index: (() => {
                const x = this.index;
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
            bump: this.bump,
            admin: this.admin.toBase58(),
            stablecoins: this.stablecoins,
            isFrozen: this.isFrozen,
            lpToken: this.lpToken.toBase58(),
            swap: this.swap,
            fees: this.fees,
            tokenMode: 'TokenMode.' + TokenMode_1.TokenMode[this.tokenMode],
        };
    }
}
exports.Pool = Pool;
/**
 * @category Accounts
 * @category generated
 */
exports.poolBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['index', beet.u64],
    ['bump', beet.u8],
    ['admin', beetSolana.publicKey],
    ['stablecoins', beet.array(beetSolana.publicKey)],
    ['isFrozen', beet.bool],
    ['lpToken', beetSolana.publicKey],
    ['swap', StableSwap_1.stableSwapBeet],
    ['fees', Fees_1.feesBeet],
    ['tokenMode', TokenMode_1.tokenModeBeet],
], Pool.fromArgs, 'Pool');
