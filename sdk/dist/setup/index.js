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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../classes");
const web3_js_1 = require("@solana/web3.js");
const signAndSendTransaction_1 = __importDefault(require("./signAndSendTransaction"));
const createToken_1 = __importDefault(require("./createToken"));
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8899";
const connection = new web3_js_1.Connection(RPC_URL);
const keypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.PRIVKEY)));
function setupGeist() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Setup");
        const admin = new classes_1.GeistAdmin({
            connection,
            superadmin: keypair
        });
        const tokens = yield Promise.all(new Array(8).fill(0).map(() => {
            return (0, createToken_1.default)(connection, keypair, keypair.publicKey);
        }));
        console.log(`Created ${tokens.length} tokens. Sleeping 20 seconds`);
        yield sleep(20);
        const ix = yield admin.initializeCore({
            platformFeeBps: 100 // 1%
        });
        const addStableIxs = yield Promise.all(tokens.map((stablecoin) => {
            return admin.addSupportForStablecoin({ stablecoin });
        }));
        yield (0, signAndSendTransaction_1.default)([ix, ...addStableIxs], connection, false, [keypair]);
        console.log("Initialized core. Whitelisted tokens: \n");
        for (let stable of tokens) {
            console.log(stable.toString() + "\n");
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield setupGeist();
}))();
