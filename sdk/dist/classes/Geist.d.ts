import { Core, ExactIn, ExactOut, Fees, Pool } from "../generated";
import { AccountMeta, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { BalanceChange } from "../types";
export default class Geist {
    connection: Connection;
    core: PublicKey;
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
    initializePool({ amp, deposits, fees, user }: {
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
    swap({ poolId, input, output, type, amount, user }: {
        poolId: BN;
        input: PublicKey;
        output: PublicKey;
        type: ExactIn | ExactOut;
        amount: BN;
        user: PublicKey;
    }): Promise<TransactionInstruction>;
    withdrawLiquidity({ poolId, lpTokenBurn, user }: {
        poolId: BN;
        lpTokenBurn: BN;
        user: PublicKey;
    }): Promise<TransactionInstruction>;
    getAllPools(): Promise<Pool[]>;
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
        index: import("@metaplex-foundation/beet").bignum;
        bump: number;
        admin: PublicKey;
        stablecoins: PublicKey[];
        isFrozen: boolean;
        lpToken: PublicKey;
        swap: import("../generated").StableSwap;
        fees: Fees;
        tokenMode: import("../generated").TokenMode;
    }[]>;
}
