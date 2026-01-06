import { EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../database";
import { ApiError, errorTypes } from "../error/api-error";
import { AdminUser, UpdateUserParams } from "../models/adminUser";

export type UserObjectIncludes = 'Loans';

export class UserQueries {
    public static async userExists(value: string, field: 'id' | 'email' | 'mobile', maanger: EntityManager = Database.manager): Promise<boolean> {
        const queryBuilder = maanger.createQueryBuilder(AdminUser, 'user')
            .where(`user.${field} = :value`, { value });
        return (await queryBuilder.getCount() > 0);
    }

    public static async findUserByIdOrFail(userId: string, manager: EntityManager): Promise<AdminUser> {
        const user = await this.findUserById(userId, [], manager);
        if (!user)
            throw new ApiError(errorTypes.userDoesNotExist);
        return user;
    }
    public static async findUserById(userId: string, includes: UserObjectIncludes[] = [], manager: EntityManager = Database.manager): Promise<AdminUser | null> {
        return this.userBasedQuery(manager, includes)
            .where('user.id = :userId', { userId })
            .getOne();
    }
    public static async getUser(field: 'id' | 'email' | 'mobile', value: string, manager: EntityManager = Database.manager): Promise<AdminUser | null> {
        const queryBuilder = manager.createQueryBuilder(AdminUser, 'user')
            .where(`user.${field} = :value`, { value });
        const user = await queryBuilder.getOne();
        return user;
    }
    public static async updateUser(user: AdminUser, params: UpdateUserParams): Promise<AdminUser> {
        const [somethingChanged, changes] = user.update(params);
        if (somethingChanged)
            await Database.manager.update(AdminUser, user.id, changes);
        return user;
    }
    private static userBasedQuery(manager: EntityManager, includes: UserObjectIncludes[]): SelectQueryBuilder<AdminUser> {
        const queryBuilder = manager.createQueryBuilder(AdminUser, 'user');

        if (includes.includes('Loans'))
            queryBuilder.leftJoinAndSelect('user.loans', 'loan');

        return queryBuilder;
    }
}