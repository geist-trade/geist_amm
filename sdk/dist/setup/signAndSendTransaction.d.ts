import { Connection, Keypair, TransactionInstruction } from "@solana/web3.js";
export default function signAndSendTransaction(instructions: TransactionInstruction[], connection: Connection, skipPreflight?: boolean, signers?: Keypair[]): Promise<string>;
