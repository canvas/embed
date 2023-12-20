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
exports.generateToken = void 0;
const libsodium_wrappers_1 = __importDefault(require("libsodium-wrappers"));
const btoa_1 = __importDefault(require("btoa"));
function generateToken(scopes, exp, key) {
    return __awaiter(this, void 0, void 0, function* () {
        yield libsodium_wrappers_1.default.ready;
        const sodium = libsodium_wrappers_1.default;
        const [keyId, keyHex] = key.split(".");
        const keyBytes = Uint8Array.from(Buffer.from(keyHex, "hex"));
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const message = { scopes: scopes, exp };
        const encryptedMessage = sodium.crypto_secretbox_easy(JSON.stringify(message), nonce, keyBytes);
        const encryptedMessageHex = Buffer.from(encryptedMessage).toString("hex");
        const nonceHex = Buffer.from(nonce).toString("hex");
        const token = { message: encryptedMessageHex, nonce: nonceHex, keyId };
        return (0, btoa_1.default)(JSON.stringify(token));
    });
}
exports.generateToken = generateToken;
