import {GeistAdmin} from "../classes";
import {Connection, Keypair, TransactionMessage} from "@solana/web3.js";
import BN from "bn.js";
import signAndSendTransaction from "./signAndSendTransaction";
import createToken from "./createToken";

function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8899";
const connection = new Connection(RPC_URL);

const keypair = Keypair.fromSecretKey(
    Uint8Array.from(
        JSON.parse(process.env.PRIVKEY)
    )
);

async function setupGeist() {
    console.log("Setup");

    const admin = new GeistAdmin({
        connection,
        superadmin: keypair
    });

    const tokens = await Promise.all(new Array(8).fill(0).map(() => {
        return createToken(connection, keypair, keypair.publicKey);
    }));

    console.log(`Created ${tokens.length} tokens. Sleeping 20 seconds`);
    await sleep(20);

    const ix = await admin.initializeCore({
        platformFeeBps: 100 // 1%
    });

    const addStableIxs = await Promise.all(tokens.map((stablecoin) => {
        return admin.addSupportForStablecoin({ stablecoin });
    }));

    await signAndSendTransaction(
        [ix, ...addStableIxs],
        connection,
        false,
        [keypair]
    );

    console.log("Initialized core. Whitelisted tokens: \n");
    for (let stable of tokens) {
        console.log(stable.toString() + "\n");
    }
}

(async () => {
    await setupGeist();
})();