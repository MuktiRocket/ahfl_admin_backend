import { EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../database";
import { User, UpdateUserParams } from "../models/user";
import { ApiError, errorTypes } from "../error/api-error";

export type UserObjectIncludes = 'Loans';

export class UserQueries {
    public static async userExists(value: string, field: 'id' | 'email' | 'mobile', maanger: EntityManager = Database.manager): Promise<boolean> {
        const queryBuilder = maanger.createQueryBuilder(User, 'user')
            .where(`user.${field} = :value`, { value });
        return (await queryBuilder.getCount() > 0);
    }

    public static async findUserByIdOrFail(userId: string, manager: EntityManager): Promise<User> {
        const user = await this.findUserById(userId, [], manager);
        if (!user)
            throw new ApiError(errorTypes.userDoesNotExist);
        return user;
    }
    public static async findUserById(userId: string, includes: UserObjectIncludes[] = [], manager: EntityManager = Database.manager): Promise<User | null> {
        return this.userBasedQuery(manager, includes)
            .where('user.id = :userId', { userId })
            .getOne();
    }
    public static async getUser(field: 'id' | 'email' | 'mobile', value: string, manager: EntityManager = Database.manager): Promise<User | null> {
        const queryBuilder = manager.createQueryBuilder(User, 'user')
            .where(`user.${field} = :value`, { value });
        const user = await queryBuilder.getOne();
        return user;
    }
    public static async updateUser(user: User, params: UpdateUserParams): Promise<User> {
        const [somethingChanged, changes] = user.update(params);
        if (somethingChanged)
            await Database.manager.update(User, user.id, changes);
        return user;
    }
    private static userBasedQuery(manager: EntityManager, includes: UserObjectIncludes[]): SelectQueryBuilder<User> {
        const queryBuilder = manager.createQueryBuilder(User, 'user');

        if (includes.includes('Loans'))
            queryBuilder.leftJoinAndSelect('user.loans', 'loan');

        return queryBuilder;
    }
}