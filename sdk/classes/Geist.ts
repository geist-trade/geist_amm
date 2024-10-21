import {Core, createInitializeCoreInstruction, createInitializePoolInstruction, PROGRAM_ID} from "../generated";
import {Connection, PublicKey, SystemProgram} from "@solana/web3.js";
import BN from "bn.js";

class Geist {
    public core: PublicKey;
    public connection: Connection;

    private constructor({ connection } : { connection: Connection }) {
        const [core] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("core")
            ],
            PROGRAM_ID
        );

        this.connection = connection;
        this.core = core;
    }

    async initializeCore({ superadmin } : { superadmin: PublicKey }) {
        const ix = createInitializeCoreInstruction(
            {
                core: this.core,
                superadmin,
                systemProgram: SystemProgram.programId
            },
            {
                args: {
                    platformFeeBps: new BN(0)
                }
            },
            PROGRAM_ID
        );

        return ix;
    }

    async getCoreData() {
        const coreData = await Core.fromAccountAddress(
            this.connection,
            this.core
        );

        return coreData;
    }

    async initializePool() {

        const {
            nextPoolId
        } = await this.getCoreData();

        const [pool] = PublicKey.findProgramAddressSync(
            []
        );

        createInitializePoolInstruction(
            {
                core: this.core,
                pool:
            },
            {
                args: {

                }
            }
        )
    }
}