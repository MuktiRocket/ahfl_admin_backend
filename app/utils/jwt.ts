import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { Env } from "./env";

export class Jwt {
    public static sign(payload: object, tokenExpiresIn?: SignOptions["expiresIn"]) {
        let options: SignOptions = {};
        if (tokenExpiresIn)
            options = { expiresIn: tokenExpiresIn };

        return jwt.sign(payload, Env.JWT_TOKEN_SECRET, options);
    }

    public static verify<G extends object | undefined = JwtPayload>(token: string): Promise<G> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, Env.JWT_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return reject('Token Expired');
                    } else if (err.name === 'JsonWebTokenError') {
                        return reject('Token Malformed');
                    } else if (err.name === 'NotBeforeError') {
                        return reject('Token Not Active');
                    }
                    return reject('Unknown Error');
                }
                resolve(decoded as G);
            });
        });
    }
}