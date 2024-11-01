import {
    Connection,
    Keypair,
    MessageV0,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";
import {AnchorProvider} from "@coral-xyz/anchor";

export default async function signAndSendTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    skipPreflight?: boolean,
    signers?: Keypair[]
) {
    const {
        lastValidBlockHeight,
        blockhash
    } = await connection.getLatestBlockhash();

    const message = new TransactionMessage({
        instructions,
        payerKey: signers[0].publicKey,
        recentBlockhash: blockhash
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);

    let signed: VersionedTransaction;
    transaction.sign(signers);
    signed = transaction;

    const txid = await connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight }
    );

    await connection.confirmTransaction({
        lastValidBlockHeight,
        blockhash,
        signature: txid
    }, "confirmed");
    //
    // const {
    //     meta: {
    //         err,
    //         logMessages
    //     }
    // } = await provider.connection.getParsedTransaction(txid, "confirmed");
    //
    // console.log({
    //     logMessages,
    //     err
    // });
    //
    // if (err) throw err;

    return txid;
}