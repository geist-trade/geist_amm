"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generated_1 = require("../generated");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const anchor_1 = require("@coral-xyz/anchor");
const geist_amm_json_1 = __importDefault(require("../idl/geist_amm.json"));
const spl_token_1 = require("@solana/spl-token");
class Geist {
    constructor({ connection }) {
        const [core] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("core")
        ], generated_1.PROGRAM_ID);
        this.connection = connection;
        this.core = core;
        // @ts-ignore
        this.program = new anchor_1.Program(geist_amm_json_1.default);
    }
    getCoreData() {
        return __awaiter(this, void 0, void 0, function* () {
            const coreData = yield generated_1.Core.fromAccountAddress(this.connection, this.core);
            return coreData;
        });
    }
    constructRemainingAccountsForLiquidityManagement(stablecoin, user, pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const [vault] = web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("vault"),
                pool.toBuffer(),
                stablecoin.toBuffer()
            ], generated_1.PROGRAM_ID);
            const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(stablecoin, user);
            const remainingAccounts = [
                {
                    pubkey: stablecoin,
                    isSigner: false,
                    isWritable: true
                },
                {
                    pubkey: vault,
                    isWritable: true,
                    isSigner: false
                },
                {
                    pubkey: ata,
                    isSigner: false,
                    isWritable: true
                }
            ];
            return remainingAccounts;
        });
    }
    createLpTokenMint(_a) {
        return __awaiter(this, arguments, void 0, function* ({ payer, mintAuthority }) {
            const keypair = web3_js_1.Keypair.generate();
            const lamports = yield this.connection.getMinimumBalanceForRentExemption(spl_token_1.MINT_SIZE);
            const createAccountIx = web3_js_1.SystemProgram.createAccount({
                newAccountPubkey: keypair.publicKey,
                fromPubkey: payer,
                lamports,
                programId: spl_token_1.TOKEN_PROGRAM_ID,
                space: spl_token_1.MINT_SIZE
            });
            const ix = (0, spl_token_1.createInitializeMintInstruction)(keypair.publicKey, 6, mintAuthority, null);
            return {
                instructions: [createAccountIx, ix],
                lpToken: keypair.publicKey
            };
        });
    }
    derivePool(id) {
        return web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("binary_pool"),
            new bn_js_1.default(id).toArrayLike(Buffer, "le", 8)
        ], generated_1.PROGRAM_ID);
    }
    initializePool(_a) {
        return __awaiter(this, arguments, void 0, function* ({ amp, deposits, fees: { swapFeeBps, liquidityRemovalFeeBps }, user }) {
            const instructions = [];
            const { nextPoolId } = yield this.getCoreData();
            const [pool] = this.derivePool(nextPoolId);
            const { lpToken, instructions: lpTokenInstructions } = yield this.createLpTokenMint({
                payer: user,
                mintAuthority: pool
            });
            instructions.push(...lpTokenInstructions);
            // (stablecoin, stablecoin_vault, stablecoin_admin_ata)
            const remainingAccounts = [];
            for (let { stablecoin } of deposits) {
                const accounts = yield this.constructRemainingAccountsForLiquidityManagement(stablecoin, user, pool);
                remainingAccounts.push(...accounts);
            }
            const ix = yield this
                .program
                .methods
                .initializePool({
                amp,
                nTokens: new bn_js_1.default(deposits.length),
                deposits: deposits.map(({ amount }) => amount),
                fees: {
                    swapFeeBps: new bn_js_1.default(swapFeeBps),
                    liquidityRemovalFeeBps: new bn_js_1.default(liquidityRemovalFeeBps)
                }
            })
                .accounts({
                admin: user,
                lpToken
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            instructions.push(ix);
            return instructions;
        });
    }
    addLiquidity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ poolId, deposits, user }) {
            const [pool] = this.derivePool(poolId);
            const { lpToken } = yield generated_1.Pool.fromAccountAddress(this.connection, pool);
            const remainingAccounts = [];
            for (let { stablecoin } of deposits) {
                const accounts = yield this.constructRemainingAccountsForLiquidityManagement(stablecoin, user, pool);
                remainingAccounts.push(...accounts);
            }
            const ix = yield this
                .program
                .methods
                .addLiquidity({
                poolId,
                deposits: deposits.map(({ amount }) => amount),
            })
                .accounts({
                user,
                lpToken
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            return ix;
        });
    }
    swap(_a) {
        return __awaiter(this, arguments, void 0, function* ({ poolId, input, output, type, amount }) {
            const [pool] = this.derivePool(poolId);
            const { stablecoins } = yield generated_1.Pool.fromAccountAddress(this.connection, pool);
            const inputId = stablecoins.map(p => p.toString()).indexOf(input.toString());
            const outputId = stablecoins.map(p => p.toString()).indexOf(output.toString());
            if (inputId == -1 || outputId == -1)
                throw new StablecoinNotSupportedError();
            if (inputId == outputId)
                throw new InputEqualsOutput();
            const mode = 'minimumReceived' in type
                ? { exactIn: [{ minimumReceived: new bn_js_1.default(type.minimumReceived) }] }
                : { exactOut: [{ maximumTaken: new bn_js_1.default(type.maximumTaken) }] };
            const remainingAccounts = stablecoins.map(stablecoin => {
                const [vault] = web3_js_1.PublicKey.findProgramAddressSync([
                    Buffer.from("vault"),
                    pool.toBuffer(),
                    stablecoin.toBuffer()
                ], generated_1.PROGRAM_ID);
                return {
                    pubkey: vault,
                    isWritable: true,
                    isSigner: false
                };
            });
            const ix = yield this
                .program
                .methods
                .swap({
                poolId,
                fromId: inputId,
                toId: outputId,
                mode: mode,
                amount
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            return ix;
        });
    }
    withdrawLiquidity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ poolId, lpTokenBurn, user }) {
            const [pool] = this.derivePool(poolId);
            const { lpToken, stablecoins } = yield generated_1.Pool.fromAccountAddress(this.connection, pool);
            const remainingAccounts = [];
            for (let stablecoin of stablecoins) {
                const accounts = yield this.constructRemainingAccountsForLiquidityManagement(stablecoin, user, pool);
                remainingAccounts.push(...accounts);
            }
            const ix = yield this
                .program
                .methods
                .withdrawLiquidity({
                poolId,
                lpTokenBurn
            })
                .accounts({
                user,
                lpToken
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            return ix;
        });
    }
    getAllPools() {
        return __awaiter(this, void 0, void 0, function* () {
            const pools = yield this
                .program
                .account
                .pool
                .all();
            return pools;
        });
    }
}
exports.default = Geist;
