import {
    Core,
    createAddLiquidityInstruction,
    createInitializePoolInstruction,
    createSwapInstruction,
    createWithdrawLiquidityInstruction,
    ExactIn,
    ExactOut,
    Fees,
    Pool, poolDiscriminator,
    PROGRAM_ID,
    SwapMode
} from "../generated";
import {
    AccountMeta,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram, SYSVAR_RENT_PUBKEY,
    TransactionInstruction
} from "@solana/web3.js";
import BN from "bn.js";
import { Program, ProgramAccount } from "@coral-xyz/anchor";
import {GeistAmm} from "../idl/geist_amm";
import GeistIdl from "../idl/geist_amm.json";
import {BalanceChange} from "../types";
import {
    createInitializeMintInstruction, getAccount,
    getAssociatedTokenAddressSync,
    MINT_SIZE,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {accountDiscriminator} from "@metaplex-foundation/solita/dist/src/utils";

export default class Geist {
    public connection: Connection;
    public core: PublicKey;

    constructor({ connection } : { connection: Connection }) {
        const [core] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("core")
            ],
            PROGRAM_ID
        );

        this.connection = connection;
        this.core = core;
    }

    async getCoreData() {
        const coreData = await Core.fromAccountAddress(
            this.connection,
            this.core
        );

        return coreData;
    }

    async constructRemainingAccountsForLiquidityManagement(
        stablecoin: PublicKey,
        user: PublicKey,
        pool: PublicKey
    ): Promise<AccountMeta[]> {

        const [vault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                pool.toBuffer(),
                stablecoin.toBuffer()
            ],
            PROGRAM_ID
        );

        const ata = getAssociatedTokenAddressSync(
            stablecoin,
            user,
        );

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
    }

    async createLpTokenMint({ payer, mintAuthority } : { payer: PublicKey, mintAuthority: PublicKey, }) {
        const keypair = Keypair.generate();

        const lamports = await this.connection.getMinimumBalanceForRentExemption(MINT_SIZE);
        const createAccountIx = SystemProgram.createAccount({
            newAccountPubkey: keypair.publicKey,
            fromPubkey: payer,
            lamports,
            programId: TOKEN_PROGRAM_ID,
            space: MINT_SIZE
        });

        const ix = createInitializeMintInstruction(
            keypair.publicKey,
            6,
            mintAuthority,
            null
        );

        return {
            instructions: [createAccountIx, ix],
            lpToken: keypair.publicKey
        };
    }

    derivePool(id: number | BN) {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("binary_pool"),
                new BN(id).toArrayLike(Buffer, "le", 8)
            ],
            PROGRAM_ID
        );
    }

    async initializePool({ amp, deposits, fees, user } : { amp: BN, deposits: BalanceChange[], fees: Fees, user: PublicKey }) {
        const instructions: TransactionInstruction[] = [];

        const {
            nextPoolId
        } = await this.getCoreData();

        const [pool] = this.derivePool(nextPoolId);

        const {
            lpToken,
            instructions: lpTokenInstructions
        } = await this.createLpTokenMint({
            payer: user,
            mintAuthority: pool
        });

        const lpTokenAdminAta = getAssociatedTokenAddressSync(
            lpToken,
            user
        );

        instructions.push(...lpTokenInstructions);

        // (stablecoin, stablecoin_vault, stablecoin_admin_ata)
        const remainingAccounts: AccountMeta[] = [];

        for (let { stablecoin } of deposits) {
            const accounts = await this.constructRemainingAccountsForLiquidityManagement(
                stablecoin,
                user,
                pool
            );
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

        const ix = createInitializePoolInstruction(
            {
                pool,
                core: this.core,
                lpToken,
                admin: user,
                lpTokenAdminAta,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
                anchorRemainingAccounts: remainingAccounts
            },
            {
                args: {
                    amp,
                    nTokens: new BN(deposits.length),
                    deposits: deposits.map(({ amount }) => amount),
                    fees
                }
            },
            PROGRAM_ID
        );

        instructions.push(ix);

        return instructions;
    }

    async addLiquidity({ poolId, deposits, user } : { poolId: BN, deposits: BalanceChange[], user: PublicKey }) {
        const [pool] = this.derivePool(poolId);

        const {
            lpToken
        } = await Pool.fromAccountAddress(
            this.connection,
            pool
        );

        const lpTokenUserAta = getAssociatedTokenAddressSync(
            lpToken,
            user
        );

        const remainingAccounts: AccountMeta[] = [];
        for (let { stablecoin } of deposits) {
            const accounts = await this.constructRemainingAccountsForLiquidityManagement(
                stablecoin,
                user,
                pool
            );
            remainingAccounts.push(...accounts);
        }

        const ix = createAddLiquidityInstruction(
            {
                lpToken,
                pool,
                user,
                core: this.core,
                tokenProgram: TOKEN_PROGRAM_ID,
                anchorRemainingAccounts: remainingAccounts,
                lpTokenUserAta
            },
            {
                args: {
                    poolId,
                    deposits: deposits.map(({ amount }) => amount),
                }
            }
        );

        return ix;
    }

    async swap({ poolId, input, output, type, amount, user } : { poolId: BN, input: PublicKey, output: PublicKey, type: ExactIn | ExactOut, amount: BN, user: PublicKey }) {

        const [pool] = this.derivePool(poolId);
        const {
            stablecoins
        } = await Pool.fromAccountAddress(
            this.connection,
            pool
        );

        const inputId = stablecoins.map(p => p.toString()).indexOf(input.toString());
        const outputId = stablecoins.map(p => p.toString()).indexOf(output.toString());

        if (inputId == -1 || outputId == -1) throw new StablecoinNotSupportedError();
        if (inputId == outputId) throw new InputEqualsOutput();

        const mode = 'minimumReceived' in type
            ? { exactIn: [{ minimumReceived: new BN(type.minimumReceived) }] }
            : { exactOut: [{ maximumTaken: new BN(type.maximumTaken) }] };

        const stablecoinInputVault = this.deriveVault({
            pool,
            stablecoin: input
        });

        const stablecoinInputUserAta = getAssociatedTokenAddressSync(
            input,
            user
        );

        const stablecoinOutputUserAta = getAssociatedTokenAddressSync(
            output,
            user
        );

        const stablecoinOutputVault = this.deriveVault({
            pool,
            stablecoin: output
        });

        const remainingAccounts: AccountMeta[] = stablecoins.map(stablecoin => {
            const [vault] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("vault"),
                    pool.toBuffer(),
                    stablecoin.toBuffer()
                ],
                PROGRAM_ID
            );

            return {
                pubkey: vault,
                isWritable: true,
                isSigner: false
            }
        });

        const ix = createSwapInstruction(
            {
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
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            {
                args: {
                    poolId,
                    fromId: inputId,
                    toId: outputId,
                    mode: mode as any,
                    amount
                }
            },
            PROGRAM_ID
        )

        return ix;
    }

    async withdrawLiquidity({ poolId, lpTokenBurn, user } : { poolId: BN, lpTokenBurn: BN, user: PublicKey }) {
        const [pool] = this.derivePool(poolId);
        const {
            lpToken,
            stablecoins
        } = await Pool.fromAccountAddress(this.connection, pool);

        const lpTokenUserAta = getAssociatedTokenAddressSync(
            lpToken,
            user
        );

        const remainingAccounts: AccountMeta[] = [];

        for (let stablecoin of stablecoins) {
            const accounts = await this.constructRemainingAccountsForLiquidityManagement(
                stablecoin,
                user,
                pool
            );
            remainingAccounts.push(...accounts);
        }

        const ix = createWithdrawLiquidityInstruction(
            {
                pool,
                core: this.core,
                user,
                lpToken,
                anchorRemainingAccounts: remainingAccounts,
                lpTokenUserAta,
            },
            {
                args: {
                    poolId,
                    lpTokenBurn
                }
            },
            PROGRAM_ID
        )

        return ix;
    }

    async getAllPools() {
        const poolsRaw = await Pool
            .gpaBuilder(PROGRAM_ID)
            .addFilter("accountDiscriminator", poolDiscriminator)
            .run(this.connection);

        const pools = poolsRaw
            .map(({ account, pubkey }) => Pool.fromAccountInfo(account))
            .map(([account]) => account);

        return pools;
    }

    async getLpBalances(pool: PublicKey, stablecoins: PublicKey[]) {
        return Promise.all(stablecoins.map(async ( stablecoin ) => {
            const vault = this.deriveVault({ pool, stablecoin });
            // This should never fail since this account will be only
            // fetched after pool exists + will never be closed.
            const {
                amount
            } = await getAccount(this.connection, vault);

            return {
                stablecoin,
                balance: new BN(amount.toString())
            };
        }));
    }

    deriveVault({ pool, stablecoin } : { pool: PublicKey, stablecoin: PublicKey }) {
        const [vault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                pool.toBuffer(),
                stablecoin.toBuffer()
            ],
            PROGRAM_ID
        );

        return vault;
    }

    async getAllPoolsWithLpBalances() {
        const pools = await this.getAllPools();

        return await Promise.all(pools.map(async (pool) => {
            const { stablecoins, index } = pool;
            const [publicKey] = this.derivePool(index);

            const lpBalances = await this.getLpBalances(publicKey, stablecoins);
            return {
                ...pool,
                lpBalances
            };
        }));
    }
}