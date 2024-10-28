import {Connection, PublicKey} from "@solana/web3.js";
import {Program} from "@coral-xyz/anchor";
import {GeistAmm} from "../idl/geist_amm";
import {Core, PROGRAM_ID} from "../generated";
import GeistIdl from "../idl/geist_amm.json";
import BN from "bn.js";

export default class GeistAdmin {
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

    async getCoreData() {
        const coreData = await Core.fromAccountAddress(
            this.connection,
            this.core
        );

        return coreData;
    }

    async initializeCore({ superadmin, platformFeeBps } : { superadmin: PublicKey, platformFeeBps: number }) {
        const ix = await this
            .program
            .methods
            .initializeCore({
                platformFeeBps: new BN(platformFeeBps)
            })
            .accounts({
                superadmin,
            })
            .instruction();

        return ix;
    }

    async addSupportForStablecoin({ stablecoin } :  { stablecoin: PublicKey }) {
        const ix = await this
            .program
            .methods
            .addStablecoin()
            .accounts({
                stablecoin
            })
            .instruction();

        return ix;
    }

    async removeSupportForStablecoin({ stablecoin } :  { stablecoin: PublicKey }) {
        const ix = await this
            .program
            .methods
            .disableStablecoin()
            .accounts({
                stablecoin
            })
            .instruction();

        return ix;
    }
}