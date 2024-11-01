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
const spl_token_1 = require("@solana/spl-token");
class Geist {
    constructor({ connection }) {
        const [core] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("core")
        ], generated_1.PROGRAM_ID);
        this.connection = connection;
        this.core = core;
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
        return __awaiter(this, arguments, void 0, function* ({ amp, deposits, fees, user }) {
            const instructions = [];
            const { nextPoolId } = yield this.getCoreData();
            const [pool] = this.derivePool(nextPoolId);
            const { lpToken, instructions: lpTokenInstructions } = yield this.createLpTokenMint({
                payer: user,
                mintAuthority: pool
            });
            const lpTokenAdminAta = (0, spl_token_1.getAssociatedTokenAddressSync)(lpToken, user);
            instructions.push(...lpTokenInstructions);
            // (stablecoin, stablecoin_vault, stablecoin_admin_ata)
            const remainingAccounts = [];
            for (let { stablecoin } of deposits) {
                const accounts = yield this.constructRemainingAccountsForLiquidityManagement(stablecoin, user, pool);
                remainingAccounts.push(...accounts);
            }
            // const ix = await this
            //     .program
            //     .methods
            //     .initializePool({
            //         amp,
            //         nTokens: new BN(deposits.length),
            //         deposits: deposits.map(({ amount }) => amount),
            //         fees: {
            //             swapFeeBps: new BN(swapFeeBps),
            //             liquidityRemovalFeeBps: new BN(liquidityRemovalFeeBps)
            //         }
            //     })
            //     .accounts({
            //         admin: user,
            //         lpToken
            //     })
            //     .remainingAccounts(remainingAccounts)
            //     .instruction();
            const ix = (0, generated_1.createInitializePoolInstruction)({
                pool,
                core: this.core,
                lpToken,
                admin: user,
                lpTokenAdminAta,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                anchorRemainingAccounts: remainingAccounts
            }, {
                args: {
                    amp,
                    nTokens: new bn_js_1.default(deposits.length),
                    deposits: deposits.map(({ amount }) => amount),
                    fees
                }
            }, generated_1.PROGRAM_ID);
            instructions.push(ix);
            return instructions;
        });
    }
    addLiquidity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ poolId, deposits, user }) {
            const [pool] = this.derivePool(poolId);
            const { lpToken } = yield generated_1.Pool.fromAccountAddress(this.connection, pool);
            const lpTokenUserAta = (0, spl_token_1.getAssociatedTokenAddressSync)(lpToken, user);
            const remainingAccounts = [];
            for (let { stablecoin } of deposits) {
                const accounts = yield this.constructRemainingAccountsForLiquidityManagement(stablecoin, user, pool);
                remainingAccounts.push(...accounts);
            }
            const ix = (0, generated_1.createAddLiquidityInstruction)({
                lpToken,
                pool,
                user,
                core: this.core,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                anchorRemainingAccounts: remainingAccounts,
                lpTokenUserAta
            }, {
                args: {
                    poolId,
                    deposits: deposits.map(({ amount }) => amount),
                }
            });
            return ix;
        });
    }
    swap(_a) {
        return __awaiter(this, arguments, void 0, function* ({ poolId, input, output, type, amount, user }) {
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
            const stablecoinInputVault = this.deriveVault({
                pool,
                stablecoin: input
            });
            const stablecoinInputUserAta = (0, spl_token_1.getAssociatedTokenAddressSync)(input, user);
            const stablecoinOutputUserAta = (0, spl_token_1.getAssociatedTokenAddressSync)(output, user);
            const stablecoinOutputVault = this.deriveVault({
                pool,
                stablecoin: output
            });
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
            const ix = (0, generated_1.createSwapInstruction)({
                pool,
                core: this.core,
                user,
                stablecoinInput: input,
                stablecoinOutput: output,
                stablecoinInputVault,
                stablecoinOutputVault,
                stablecoinInputUserAta,
                stablecoinOutputUserAta,
                anchorRemainingAccounts: remainingAccounts,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            }, {
                args: {
                    poolId,
                    fromId: inputId,
                    toId: outputId,
                    mode: mode,
                    amount
                }
            }, generated_1.PROGRAM_ID);
            return ix;
        });
    }
    withdrawLiquidity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ poolId, lpTokenBurn, user }) {
            const [pool] = this.derivePool(poolId);
            const { lpToken, stablecoins } = yield generated_1.Pool.fromAccountAddress(this.connection, pool);
            const lpTokenUserAta = (0, spl_token_1.getAssociatedTokenAddressSync)(lpToken, user);
            const remainingAccounts = [];
            for (let stablecoin of stablecoins) {
                const accounts = yield this.constructRemainingAccountsForLiquidityManagement(stablecoin, user, pool);
                remainingAccounts.push(...accounts);
            }
            const ix = (0, generated_1.createWithdrawLiquidityInstruction)({
                pool,
                core: this.core,
                user,
                lpToken,
                anchorRemainingAccounts: remainingAccounts,
                lpTokenUserAta,
            }, {
                args: {
                    poolId,
                    lpTokenBurn
                }
            }, generated_1.PROGRAM_ID);
            return ix;
        });
    }
    getAllPools() {
        return __awaiter(this, void 0, void 0, function* () {
            const poolsRaw = yield generated_1.Pool
                .gpaBuilder(generated_1.PROGRAM_ID)
                .addFilter("accountDiscriminator", generated_1.poolDiscriminator)
                .run(this.connection);
            const pools = poolsRaw
                .map(({ account, pubkey }) => generated_1.Pool.fromAccountInfo(account))
                .map(([account]) => account);
            return pools;
        });
    }
    getLpBalances(pool, stablecoins) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(stablecoins.map((stablecoin) => __awaiter(this, void 0, void 0, function* () {
                const vault = this.deriveVault({ pool, stablecoin });
                // This should never fail since this account will be only
                // fetched after pool exists + will never be closed.
                const { amount } = yield (0, spl_token_1.getAccount)(this.connection, vault);
                return {
                    stablecoin,
                    balance: new bn_js_1.default(amount.toString())
                };
            })));
        });
    }
    deriveVault({ pool, stablecoin }) {
        const [vault] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("vault"),
            pool.toBuffer(),
            stablecoin.toBuffer()
        ], generated_1.PROGRAM_ID);
        return vault;
    }
    getAllPoolsWithLpBalances() {
        return __awaiter(this, void 0, void 0, function* () {
            const pools = yield this.getAllPools();
            return yield Promise.all(pools.map((pool) => __awaiter(this, void 0, void 0, function* () {
                const { stablecoins, index } = pool;
                const [publicKey] = this.derivePool(index);
                const lpBalances = yield this.getLpBalances(publicKey, stablecoins);
                return Object.assign(Object.assign({}, pool), { lpBalances });
            })));
        });
    }
}
exports.default = Geist;
