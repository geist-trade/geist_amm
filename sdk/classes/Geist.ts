import {
    Core,
    createInitializeCoreInstruction,
    createInitializePoolInstruction, ExactIn, ExactOut,
    Fees,
    Pool,
    PROGRAM_ID, SwapMode
} from "../generated";
import {
    AccountMeta,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    TransactionInstruction
} from "@solana/web3.js";
import BN from "bn.js";
import { Program } from "@coral-xyz/anchor";
import {GeistAmm} from "../../target/types/geist_amm";
import GeistIdl from "../../target/idl/geist_amm.json";
import {BalanceChange} from "../types";
import {
    createInitializeMintInstruction,
    getAssociatedTokenAddressSync,
    MINT_SIZE,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";

class Geist {
    public connection: Connection;
    public core: PublicKey;
    public program: Program<GeistAmm>;

    constructor({ connection } : { connection: Connection }) {
        const [core] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("core")
            ],
            PROGRAM_ID
        );

        this.connection = connection;
        this.core = core;

        // @ts-ignore
        this.program = new Program<GeistAmm>(GeistIdl);
    }

    async initializeCore({ superadmin, platformFeeBps } : { superadmin: PublicKey, platformFeeBps: number }) {
        const [core] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("core")
            ],
            PROGRAM_ID
        );

        const ix = await this
            .program
            .methods
            .initializeCore({
                platformFeeBps: new BN(platformFeeBps)
            })
            .accounts({
                superadmin
            })
            .instruction();

        return ix;
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

    async initializePool({ amp, deposits, fees: { swapFeeBps, liquidityRemovalFeeBps }, user } : { amp: BN, deposits: BalanceChange[], fees: Fees, user: PublicKey }) {
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

        const ix = await this
            .program
            .methods
            .initializePool({
                amp,
                nTokens: new BN(deposits.length),
                deposits: deposits.map(({ amount }) => amount),
                fees: {
                    swapFeeBps: new BN(swapFeeBps),
                    liquidityRemovalFeeBps: new BN(liquidityRemovalFeeBps)
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
    }

    async addLiquidity({ poolId, deposits, user } : { poolId: BN, deposits: BalanceChange[], user: PublicKey }) {
        const [pool] = this.derivePool(poolId);

        const {
            lpToken
        } = await Pool.fromAccountAddress(
            this.connection,
            pool
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

        const ix = await this
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
    }

    async swap({ poolId, input, output, type, amount } : { poolId: BN, input: PublicKey, output: PublicKey, type: ExactIn | ExactOut, amount: BN }) {

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

        const ix = await this
            .program
            .methods
            .swap({
                poolId,
                fromId: inputId,
                toId: outputId,
                mode: mode as any,
                amount
            })
            .remainingAccounts(remainingAccounts)
            .instruction();

        return ix;
    }

    async withdrawLiquidity({ poolId, lpTokenBurn, user } : { poolId: BN, lpTokenBurn: BN, user: PublicKey }) {
        const [pool] = this.derivePool(poolId);
        const {
            lpToken,
            stablecoins
        } = await Pool.fromAccountAddress(this.connection, pool);

        const remainingAccounts: AccountMeta[] = [];

        for (let stablecoin of stablecoins) {
            const accounts = await this.constructRemainingAccountsForLiquidityManagement(
                stablecoin,
                user,
                pool
            );
            remainingAccounts.push(...accounts);
        }

        const ix = await this
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
    }
}