import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Core } from "../generated";
export default class GeistAdmin {
    connection: Connection;
    core: PublicKey;
    superadmin: Keypair;
    constructor({ connection, superadmin }: {
        connection: Connection;
        superadmin: Keypair;
    });
    getCoreData(): Promise<Core>;
    initializeCore({ platformFeeBps }: {
        platformFeeBps: number;
    }): Promise<import("@solana/web3.js").TransactionInstruction>;
    addSupportForStablecoin({ stablecoin }: {
        stablecoin: PublicKey;
    }): Promise<import("@solana/web3.js").TransactionInstruction>;
    removeSupportForStablecoin({ stablecoin }: {
        stablecoin: PublicKey;
    }): Promise<import("@solana/web3.js").TransactionInstruction>;
}
