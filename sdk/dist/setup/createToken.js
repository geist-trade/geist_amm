"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
function createToken(connection, payer, mintAuthority) {
    return __awaiter(this, void 0, void 0, function* () {
        const keypair = web3_js_1.Keypair.generate();
        const lamports = yield connection.getMinimumBalanceForRentExemption(spl_token_1.MINT_SIZE);
        const createAccountIx = web3_js_1.SystemProgram.createAccount({
            newAccountPubkey: keypair.publicKey,
            fromPubkey: payer.publicKey,
            lamports,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
            space: spl_token_1.MINT_SIZE
        });
        const ix = (0, spl_token_1.createInitializeMintInstruction)(keypair.publicKey, 6, mintAuthority, null);
        const tx = new web3_js_1.Transaction();
        tx.add(createAccountIx, ix);
        const { lastValidBlockHeight, blockhash } = yield connection.getLatestBlockhash();
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = blockhash;
        tx.sign(keypair, payer);
        const sent = yield connection.sendRawTransaction(tx.serialize());
        yield connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature: sent
        });
        return keypair.publicKey;
    });
}
exports.default = createToken;
