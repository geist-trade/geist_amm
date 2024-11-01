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
const generated_1 = require("../generated");
class GeistAdmin {
    constructor({ connection, superadmin }) {
        const [core] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("core")
        ], generated_1.PROGRAM_ID);
        this.connection = connection;
        this.core = core;
        this.superadmin = superadmin;
    }
    getCoreData() {
        return __awaiter(this, void 0, void 0, function* () {
            const coreData = yield generated_1.Core.fromAccountAddress(this.connection, this.core);
            return coreData;
        });
    }
    initializeCore(_a) {
        return __awaiter(this, arguments, void 0, function* ({ platformFeeBps }) {
            const ix = (0, generated_1.createInitializeCoreInstruction)({
                core: this.core,
                superadmin: this.superadmin.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            }, {
                args: {
                    platformFeeBps
                }
            }, generated_1.PROGRAM_ID);
            return ix;
        });
    }
    addSupportForStablecoin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ stablecoin }) {
            const ix = (0, generated_1.createAddStablecoinInstruction)({
                core: this.core,
                superadmin: this.superadmin.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
                stablecoin: stablecoin,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY
            }, generated_1.PROGRAM_ID);
            return ix;
        });
    }
    removeSupportForStablecoin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ stablecoin }) {
            const ix = (0, generated_1.createDisableStablecoinInstruction)({
                core: this.core,
                superadmin: this.superadmin.publicKey,
                stablecoin,
            }, generated_1.PROGRAM_ID);
            return ix;
        });
    }
}
exports.default = GeistAdmin;
