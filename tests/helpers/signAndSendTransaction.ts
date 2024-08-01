import {Keypair, MessageV0, TransactionMessage, VersionedTransaction} from "@solana/web3.js";
import {AnchorProvider} from "@coral-xyz/anchor";

export default async function signAndSendTransaction(
    message: MessageV0,
    provider: AnchorProvider,
    signers?: Keypair[]
) {
    const {
        lastValidBlockHeight,
        blockhash
    } = await provider.connection.getLatestBlockhash();

    const transaction = new VersionedTransaction(message);

    if (signers && signers.length) transaction.sign(signers);
    const signed = await provider.wallet.signTransaction(transaction);

    const txid = await provider.connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight: false }
    );

    await provider.connection.confirmTransaction({
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