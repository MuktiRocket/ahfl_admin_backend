import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { Customer } from "../../models/customer";
import { GeneralQueries } from "../../queries/general-queries";
import { PaginationParams } from "../controller";

export interface AdminCustomerDataParams {
    query?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}

export class AdminCustomerDataService {
    private static applyCreatedAtFilter(qb: SelectQueryBuilder<Customer>, params: AdminCustomerDataParams) {
        const from = params.from;
        const to = params.to;

        if (from)
            qb.andWhere('user_data.createdAt >= :from', { from: `${from} 00:00:00` });

        if (to)
            qb.andWhere('user_data.createdAt <= :to', { to: `${to} 23:59:59` });
    }

    private static applyQueryFilter(queryBuilder: SelectQueryBuilder<Customer>, params: AdminCustomerDataParams) {
        if (!params.query) return;

        const q = `%${params.query}%`;

        queryBuilder.andWhere(
            new Brackets(subQb => {
                subQb
                    .where('user_data.uid LIKE :q', { q })
                    .orWhere('user_data.mobile_number LIKE :q', { q })
                    .orWhere('user_data.loanAccountNumber LIKE :q', { q })
                    .orWhere('user_data.dob LIKE :q', { q })
                    .orWhere('user_data.customer_data LIKE :q', { q });
            })
        );
    }

    private static getQueryBuilder(params: AdminCustomerDataParams, manager: EntityManager = Database.manager): SelectQueryBuilder<Customer> {

        const queryBuilder = manager.createQueryBuilder(Customer, 'user_data');

        this.applyCreatedAtFilter(queryBuilder, params);
        this.applyQueryFilter(queryBuilder, params);

        queryBuilder.orderBy('user_data.id', 'DESC');

        return queryBuilder;
    }

    public static async getAllCustomerData(params: AdminCustomerDataParams, paginationParams: PaginationParams): Promise<[Customer[], number]> {
        const qb = this.getQueryBuilder(params);

        return await qb.skip(paginationParams.offset).take(paginationParams.limit).getManyAndCount();
    }

    public static async getAllCustomersForCsv(params: AdminCustomerDataParams): Promise<Customer[]> {
        const queryBuilder = this.getQueryBuilder(params);

        GeneralQueries.addDateRangeFilter(queryBuilder, 'user_data', { fromDate: params.from, toDate: params.to });

        return await queryBuilder.getMany();
    }
}