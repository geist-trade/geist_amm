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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCoreInstructionDiscriminator = exports.initializeCoreStruct = void 0;
exports.createInitializeCoreInstruction = createInitializeCoreInstruction;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const InitializeCoreArgs_1 = require("../types/InitializeCoreArgs");
/**
 * @category Instructions
 * @category InitializeCore
 * @category generated
 */
exports.initializeCoreStruct = new beet.BeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', InitializeCoreArgs_1.initializeCoreArgsBeet],
], 'InitializeCoreInstructionArgs');
exports.initializeCoreInstructionDiscriminator = [
    26, 107, 177, 14, 71, 136, 11, 91,
];
/**
 * Creates a _InitializeCore_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeCore
 * @category generated
 */
function createInitializeCoreInstruction(accounts, args, programId = new web3.PublicKey('AVzr6agjgPNhh4i4bTRLt9rLv48Nj4v5qKxMvgYty21n')) {
    var _a;
    const [data] = exports.initializeCoreStruct.serialize(Object.assign({ instructionDiscriminator: exports.initializeCoreInstructionDiscriminator }, args));
    const keys = [
        {
            pubkey: accounts.superadmin,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: accounts.core,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: (_a = accounts.systemProgram) !== null && _a !== void 0 ? _a : web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        },
    ];
    if (accounts.anchorRemainingAccounts != null) {
        for (const acc of accounts.anchorRemainingAccounts) {
            keys.push(acc);
        }
    }
    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}
