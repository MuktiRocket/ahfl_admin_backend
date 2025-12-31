import { Env } from "./env";
import CryptoJS from "crypto-js";
import { createHash } from 'crypto';

type HashingAlgorithm = 'sha256' | 'sha512' | 'md5';

export class CryptoHelper {
    public static encryptTextAES(plainText: string, secretKey: string = Env.CRYPTO_SECRET_KEY): string {
        const encrypted = CryptoJS.AES.encrypt(plainText, secretKey);
        return encrypted.toString();
    }

    public static decryptTextAES(cipherText: string, secretKey: string = Env.CRYPTO_SECRET_KEY): string {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    public static hashWithAlgorithm(text: string, hashingAlgorithm: HashingAlgorithm = "sha512") {
        const hash = createHash(hashingAlgorithm);
        hash.update(text);
        const hashedData = hash.digest('hex');
        return hashedData;
    }

}
