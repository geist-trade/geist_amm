import { Connection, Keypair, PublicKey } from "@solana/web3.js";
declare function createToken(connection: Connection, payer: Keypair, mintAuthority: PublicKey): Promise<PublicKey>;
export default createToken;
