import {
    AddressLookupTableProgram,
    MessageV0,
    PublicKey,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";
import {AnchorProvider} from "@coral-xyz/anchor";

export default async function createLookupTables(
    provider: AnchorProvider,
    addresses: PublicKey[]
) {
    const {
        lastValidBlockHeight,
        blockhash
    } = await provider.connection.getLatestBlockhash();

    const slot = await provider.connection.getSlot('finalized');

    const [createIx, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
        payer: provider.publicKey,
        authority: provider.publicKey,
        recentSlot: slot,
    });

    const extendIx = AddressLookupTableProgram.extendLookupTable({
        payer: provider.publicKey,
        lookupTable: lookupTableAddress,
        authority: provider.publicKey,
        addresses
    });

    const message = new TransactionMessage({
        payerKey: provider.publicKey,
        instructions: [createIx, extendIx],
        recentBlockhash: blockhash
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);
    const signed = await provider.wallet.signTransaction(transaction);
    const signature = await provider.connection.sendRawTransaction(signed.serialize());
    await provider.connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
    });

    return lookupTableAddress;
}