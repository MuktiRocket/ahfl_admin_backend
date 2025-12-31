import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError, errorTypes } from "../error/api-error";
import { Env } from "../utils/env";
import { logger } from "../utils/logger";
import { Jwt } from "../utils/jwt";
import { UserQueries, UserObjectIncludes } from "../queries/user-queries";
import { JwtPayload } from "jsonwebtoken";

export interface AuthUser {
    isGuest: boolean,
    userId: string
}

export interface UserJwtPayLoad extends JwtPayload {
    userId: string;
}

export class AuthHandler {
    public static async authentiateGuestUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
            const error = new ApiError(errorTypes.noAuthToken);
            return next(error);
        }

        const token = authHeader.substring('bearer '.length, authHeader.length);
        try {
            const auth = await AuthHandler.validateGuestToken(token);
            res.locals.auth = auth;
            return next();
        } catch (error) {
            logger.error(error);
            return next(error);
        }
    }

    public static authenticateUser(userObjectIncludes: UserObjectIncludes[] = []): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
                const error = new ApiError(errorTypes.noAuthToken);
                return next(error);
            }

            const token = authHeader.substring('bearer '.length, authHeader.length);
            try {
                const auth = await AuthHandler.validateToken(token);
                res.locals.auth = auth;
                const user = await UserQueries.getUser('id', auth.userId);

                if (!user)
                    next(new ApiError(errorTypes.invalidToken));

                res.locals.user = user;
                return next();
            } catch (error) {
                logger.error(error);
                return next(error);
            }
        };
    }

    private static validateGuestToken(token: string): Promise<AuthUser> {
        return new Promise((resolve, reject) => {
            if (!token)
                reject(new ApiError(errorTypes.noAuthToken));

            if (!token.toLowerCase().startsWith('guest-'))
                reject(new ApiError(errorTypes.invalidToken));

            if (token === Env.GUEST_TOKEN) {
                const auth: AuthUser = {
                    isGuest: true,
                    userId: 'guestUserId'
                };
                return resolve(auth);
            } else {
                return reject(new ApiError(errorTypes.invalidToken));
            }
        });
    }

    private static validateToken(token: string): Promise<AuthUser> {
        return new Promise((resolve, reject) => {
            if (!token)
                reject(new ApiError(errorTypes.noAuthToken));

            Jwt.verifyAccessToken<UserJwtPayLoad>(token).then((decodedData) => {
                if (!decodedData)
                    return reject(new ApiError(errorTypes.invalidToken));
                const auth: AuthUser = {
                    isGuest: false,
                    userId: decodedData.userId
                };
                resolve(auth);
            }).catch((err) => {
                reject(err);
            });
        });
    }
}