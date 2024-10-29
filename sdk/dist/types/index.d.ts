import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
type BalanceChange = {
    stablecoin: PublicKey;
    amount: BN;
};
export type { BalanceChange, };
