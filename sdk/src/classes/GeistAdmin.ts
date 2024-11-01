import {Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY} from "@solana/web3.js";
import {AnchorProvider, Program, setProvider, Wallet} from "@coral-xyz/anchor";
import {GeistAmm} from "../idl/geist_amm";
import {
    Core,
    createAddStablecoinInstruction,
    createDisableStablecoinInstruction,
    createInitializeCoreInstruction,
    PROGRAM_ID
} from "../generated";
import GeistIdl from "../idl/geist_amm.json";
import BN from "bn.js";

export default class GeistAdmin {
    public connection: Connection;
    public core: PublicKey;
    public superadmin: Keypair;

    constructor({ connection, superadmin } : { connection: Connection, superadmin: Keypair }) {
        const [core] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("core")
            ],
            PROGRAM_ID
        );

        this.connection = connection;
        this.core = core;
        this.superadmin = superadmin;
    }

    async getCoreData() {
        const coreData = await Core.fromAccountAddress(
            this.connection,
            this.core
        );

        return coreData;
    }

    async initializeCore({ platformFeeBps } : { platformFeeBps: number }) {
        const ix = createInitializeCoreInstruction(
            {
                core: this.core,
                superadmin: this.superadmin.publicKey,
                systemProgram: SystemProgram.programId,
            },
            {
                args: {
                    platformFeeBps
                }
            },
            PROGRAM_ID
        );

        return ix;
    }

    async addSupportForStablecoin({ stablecoin } :  { stablecoin: PublicKey }) {
        const ix = createAddStablecoinInstruction(
            {
                core: this.core,
                superadmin: this.superadmin.publicKey,
                systemProgram: SystemProgram.programId,
                stablecoin: stablecoin,
                rent: SYSVAR_RENT_PUBKEY
            },
            PROGRAM_ID
        );

        return ix;
    }

    async removeSupportForStablecoin({ stablecoin } :  { stablecoin: PublicKey }) {
        const ix = createDisableStablecoinInstruction(
            {
                core: this.core,
                superadmin: this.superadmin.publicKey,
                stablecoin,
            },
            PROGRAM_ID
        );

        return ix;
    }
}