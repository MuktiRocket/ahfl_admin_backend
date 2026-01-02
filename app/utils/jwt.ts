import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { Env } from "./env";
import { ApiError, errorTypes } from "../error/api-error";

export enum TokenExpiry {
    THIRY_SECONDS = "30s",

    // min
    FIVE_MINUTES = "5m",
    TEN_MINUTES = "10m",
    THIRTY_MINUTES = '30m',

    // hr
    ONE_HOUR = "1h",
    THREE_HOURS = "3h",

    // day
    ONE_DAY = "1d",
    THREE_DAYS = "3d",

    // week
    ONE_WEEK = "1w",
    TWO_WEEK = "2w",

    // month & year
    ONE_MONTH = "30d",
    THREE_MONTHS = "90d",
    ONE_YEAR = "365d"
}

const PRIVATE_KEY = Env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n');
const PUBLIC_KEY = Env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n');

export class Jwt {
    private static verify<G extends object | undefined = JwtPayload>(token: string, TokenSecret: string): Promise<G> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, TokenSecret, { algorithms: ["RS256"] }, (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError' || err.name === 'NotBeforeError')
                        return reject(new ApiError(errorTypes.expiredToken));

                    return reject(new ApiError(errorTypes.unknownAuthError));
                }
                if (!decoded)
                    return reject(new ApiError(errorTypes.unknownAuthError));

                resolve(decoded as G);
            });
        });
    }

    public static signAccessToken(payload: object, tokenExpiresIn?: string): string {
        const options: SignOptions = { algorithm: "RS256", expiresIn: tokenExpiresIn || Env.JWT_TOKEN_EXPIRY_MIN };
        return jwt.sign(payload, PRIVATE_KEY, options);
    }

    public static signRefreshToken(userId: string): string {
        const refreshToken = jwt.sign({ userId }, PRIVATE_KEY, { algorithm: "RS256", expiresIn: TokenExpiry.ONE_MONTH });
        return refreshToken;
    }

    public static async verifyAccessToken<G extends object | undefined = JwtPayload>(token: string): Promise<G> {
        return await Jwt.verify(token, PUBLIC_KEY);
    }

    public static async verifyRefreshToken<G extends object | undefined = JwtPayload>(token: string): Promise<G> {
        return await Jwt.verify(token, PUBLIC_KEY);
    }
}
