import { Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { GeistAmm } from "../idl/geist_amm";
import { Core } from "../generated";
export default class GeistAdmin {
    connection: Connection;
    core: PublicKey;
    program: Program<GeistAmm>;
    constructor({ connection }: {
        connection: Connection;
    });
    getCoreData(): Promise<Core>;
    initializeCore({ superadmin, platformFeeBps }: {
        superadmin: PublicKey;
        platformFeeBps: number;
    }): Promise<import("@solana/web3.js").TransactionInstruction>;
    addSupportForStablecoin({ stablecoin }: {
        stablecoin: PublicKey;
    }): Promise<import("@solana/web3.js").TransactionInstruction>;
    removeSupportForStablecoin({ stablecoin }: {
        stablecoin: PublicKey;
    }): Promise<import("@solana/web3.js").TransactionInstruction>;
}
