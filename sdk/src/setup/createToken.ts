import {Connection, Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {AnchorProvider} from "@coral-xyz/anchor";
import {createInitializeMintInstruction, MINT_SIZE, TOKEN_PROGRAM_ID} from "@solana/spl-token";

async function createToken(
    connection: Connection,
    payer: Keypair,
    mintAuthority: PublicKey,
) {
    const keypair = Keypair.generate();

    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    const createAccountIx = SystemProgram.createAccount({
        newAccountPubkey: keypair.publicKey,
        fromPubkey: payer.publicKey,
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

    const tx = new Transaction();
    tx.add(createAccountIx, ix);

    const {
        lastValidBlockHeight,
        blockhash
    } = await connection.getLatestBlockhash();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;

    tx.sign(keypair, payer);

    const sent = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature: sent
    });

    return keypair.publicKey;
}

export default createToken;