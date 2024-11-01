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
exports.default = signAndSendTransaction;
const web3_js_1 = require("@solana/web3.js");
function signAndSendTransaction(instructions, connection, skipPreflight, signers) {
    return __awaiter(this, void 0, void 0, function* () {
        const { lastValidBlockHeight, blockhash } = yield connection.getLatestBlockhash();
        const message = new web3_js_1.TransactionMessage({
            instructions,
            payerKey: signers[0].publicKey,
            recentBlockhash: blockhash
        }).compileToV0Message();
        const transaction = new web3_js_1.VersionedTransaction(message);
        let signed;
        transaction.sign(signers);
        signed = transaction;
        const txid = yield connection.sendRawTransaction(signed.serialize(), { skipPreflight });
        yield connection.confirmTransaction({
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
    });
}
