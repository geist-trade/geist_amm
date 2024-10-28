import { Core, ExactIn, ExactOut, Fees } from "../generated";
import { AccountMeta, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { Program } from "@coral-xyz/anchor";
import { GeistAmm } from "../idl/geist_amm";
import { BalanceChange } from "../types";
export default class Geist {
    connection: Connection;
    core: PublicKey;
    program: Program<GeistAmm>;
    constructor({ connection }: {
        connection: Connection;
    });
    getCoreData(): Promise<Core>;
    constructRemainingAccountsForLiquidityManagement(stablecoin: PublicKey, user: PublicKey, pool: PublicKey): Promise<AccountMeta[]>;
    createLpTokenMint({ payer, mintAuthority }: {
        payer: PublicKey;
        mintAuthority: PublicKey;
    }): Promise<{
        instructions: TransactionInstruction[];
        lpToken: PublicKey;
    }>;
    derivePool(id: number | BN): [PublicKey, number];
    initializePool({ amp, deposits, fees: { swapFeeBps, liquidityRemovalFeeBps }, user }: {
        amp: BN;
        deposits: BalanceChange[];
        fees: Fees;
        user: PublicKey;
    }): Promise<TransactionInstruction[]>;
    addLiquidity({ poolId, deposits, user }: {
        poolId: BN;
        deposits: BalanceChange[];
        user: PublicKey;
    }): Promise<TransactionInstruction>;
    swap({ poolId, input, output, type, amount }: {
        poolId: BN;
        input: PublicKey;
        output: PublicKey;
        type: ExactIn | ExactOut;
        amount: BN;
    }): Promise<TransactionInstruction>;
    withdrawLiquidity({ poolId, lpTokenBurn, user }: {
        poolId: BN;
        lpTokenBurn: BN;
        user: PublicKey;
    }): Promise<TransactionInstruction>;
    getAllPools(): Promise<import("@coral-xyz/anchor").ProgramAccount<{
        index: BN;
        bump: number;
        admin: PublicKey;
        stablecoins: PublicKey[];
        isFrozen: boolean;
        lpToken: PublicKey;
        swap: {
            amp: BN;
            nTokens: BN;
            mode: ({
                multi?: never;
            } & {
                binary: Record<string, never>;
            }) | ({
                binary?: never;
            } & {
                multi: Record<string, never>;
            });
        };
        fees: {
            swapFeeBps: BN;
            liquidityRemovalFeeBps: BN;
        };
        tokenMode: ({
            compressed?: never;
        } & {
            spl: Record<string, never>;
        }) | ({
            spl?: never;
        } & {
            compressed: Record<string, never>;
        });
    }>[]>;
    getLpBalances(pool: PublicKey, stablecoins: PublicKey[]): Promise<{
        stablecoin: PublicKey;
        balance: BN;
    }[]>;
    deriveVault({ pool, stablecoin }: {
        pool: PublicKey;
        stablecoin: PublicKey;
    }): PublicKey;
    getAllPoolsWithLpBalances(): Promise<{
        lpBalances: {
            stablecoin: PublicKey;
            balance: BN;
        }[];
        publicKey: PublicKey;
        account: {
            index: BN;
            bump: number;
            admin: PublicKey;
            stablecoins: PublicKey[];
            isFrozen: boolean;
            lpToken: PublicKey;
            swap: {
                amp: BN;
                nTokens: BN;
                mode: ({
                    multi?: never;
                } & {
                    binary: Record<string, never>;
                }) | ({
                    binary?: never;
                } & {
                    multi: Record<string, never>;
                });
            };
            fees: {
                swapFeeBps: BN;
                liquidityRemovalFeeBps: BN;
            };
            tokenMode: ({
                compressed?: never;
            } & {
                spl: Record<string, never>;
            }) | ({
                spl?: never;
            } & {
                compressed: Record<string, never>;
            });
        };
    }[]>;
}
