import { EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../database";
import { User } from "../models/user";
import { ApiError, errorTypes } from "../error/api-error";

export type UserObjectIncludes = 'Loans';

export class UserQueries {
    public static async userExists(value: string, field: 'id' | 'email' | 'mobile', maanger: EntityManager = Database.manager): Promise<boolean> {
        const queryBuilder = maanger.createQueryBuilder(User, 'user')
            .where(`user.${field} = :value`, { value });
        return (await queryBuilder.getCount() > 0);
    }

    public static async findUserByIdOrFail(userId: string, manager: EntityManager): Promise<User> {
        const user = await this.getUser(userId, 'id', [], manager);
        if (!user)
            throw new ApiError(errorTypes.userDoesNotExist);
        return user;
    }

    public static async getUser(value: string, field: 'id' | 'email' | 'mobile', includes: UserObjectIncludes[] = [], manager: EntityManager = Database.manager): Promise<User | null> {
        return this.userBasedQuery(manager)
            .where(`user.${field} = :value`, { value })
            .getOne();
    }

    private static userBasedQuery(manager: EntityManager): SelectQueryBuilder<User> {
        const queryBuilder = manager.createQueryBuilder(User, 'user');
        return queryBuilder;
    }
}