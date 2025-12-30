import { DeleteResult } from "typeorm";
import { Database } from "../database";
import { CreateTokenParams, Token } from "../models/token";

export class TokenService {
    public static async addRefreshToken(params: CreateTokenParams): Promise<Token> {
        const token = new Token(params);
        return Database.manager.save(token);
    }

    public static async isRefreshTokenExists(refreshToken: string): Promise<boolean> {
        const queryBuilder = Database.manager.createQueryBuilder(Token, 'token')
            .where('token.refreshToken = :refreshToken', { refreshToken });
        return queryBuilder.getExists();
    }

    public static async revokeRefreshToken(refreshToken: string): Promise<DeleteResult> {
        return Database.manager.createQueryBuilder()
            .delete()
            .from(Token, 'token')
            .where('token.refreshToken = :refreshToken', { refreshToken })
            .execute();
    }

    public static async revokeAllRefreshTokens(userId: string): Promise<DeleteResult> {
        return Database.manager.createQueryBuilder()
            .delete()
            .from(Token, 'token')
            .where('token.userId = :userId', { userId })
            .execute();
    }
}