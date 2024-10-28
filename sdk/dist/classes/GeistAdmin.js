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
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const generated_1 = require("../generated");
const geist_amm_json_1 = __importDefault(require("../idl/geist_amm.json"));
const bn_js_1 = __importDefault(require("bn.js"));
class GeistAdmin {
    constructor({ connection }) {
        const [core] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("core")
        ], generated_1.PROGRAM_ID);
        this.connection = connection;
        this.core = core;
        // @ts-ignore
        this.program = new anchor_1.Program(geist_amm_json_1.default);
    }
    getCoreData() {
        return __awaiter(this, void 0, void 0, function* () {
            const coreData = yield generated_1.Core.fromAccountAddress(this.connection, this.core);
            return coreData;
        });
    }
    initializeCore(_a) {
        return __awaiter(this, arguments, void 0, function* ({ superadmin, platformFeeBps }) {
            const ix = yield this
                .program
                .methods
                .initializeCore({
                platformFeeBps: new bn_js_1.default(platformFeeBps)
            })
                .accounts({
                superadmin,
            })
                .instruction();
            return ix;
        });
    }
    addSupportForStablecoin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ stablecoin }) {
            const ix = yield this
                .program
                .methods
                .addStablecoin()
                .accounts({
                stablecoin
            })
                .instruction();
            return ix;
        });
    }
    removeSupportForStablecoin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ stablecoin }) {
            const ix = yield this
                .program
                .methods
                .disableStablecoin()
                .accounts({
                stablecoin
            })
                .instruction();
            return ix;
        });
    }
}
exports.default = GeistAdmin;
