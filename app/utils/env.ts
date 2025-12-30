import dotenv from 'dotenv';
import { logger } from "./logger";

dotenv.config();
class AppEnv {
    private static instance: AppEnv;

    private constructor() {
        this.loadFromEnv();
    }

    static getInstance(): AppEnv {
        if (!AppEnv.instance) {
            AppEnv.instance = new AppEnv();
        }
        return AppEnv.instance;
    }

    // Envronments
    readonly NODE_ENV: string = "";
    readonly ENV_NAME: string = "";
    readonly API_PORT: string = "";
    // Email
    readonly EMAIL_SERVICE: string = "";
    readonly EMAIL_USER: string = "";
    readonly EMAIL_PASS: string = "";
    readonly EMAIL_SMTP_URL: string = "";
    readonly EMAIL_SMTP_PORT: string = "";
    readonly EMAIL_SMTP_SECURE: string = "";
    // Database
    readonly DB_HOST: string = "";
    readonly DB_PORT: string = "";
    readonly DB_USERNAME: string = "";
    readonly DB_PASSWORD: string = "";
    readonly DB_NAME: string = "";
    readonly DB_SYNC: string = "";

    // JWT
    readonly GUEST_TOKEN: string = "";
    readonly JWT_PRIVATE_KEY: string = "";
    readonly JWT_PUBLIC_KEY: string = "";
    readonly JWT_TOKEN_EXPIRY_MIN: string = "";

    // Cryptojs
    readonly CRYPTO_SECRET_KEY: string = "";
    readonly DEFAULT_PASSWORD_SALT: string = "";


    loadFromEnv() {
        Object.keys(this).forEach(key => {
            const value = process.env[key];
            if (value == undefined)
                throw new Error(`${key} is missing from the .env file`);

            // eslint-disable-next-line
            (this as any)[key] = value;
        });
        logger.info(`Loaded ${Object.keys(this).length} environment variables successfully ...`);
    }
}

// Export singleton instance
export const Env = AppEnv.getInstance();