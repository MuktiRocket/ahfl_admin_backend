import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { Customer } from "../../models/customer";
import { GeneralQueries } from "../../queries/general-queries";
import { PaginationParams } from "../controller";

export interface AdminCustomerDataParams {
    query?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
}

export class AdminCustomerDataService {
    private static applyCreatedAtFilter(qb: SelectQueryBuilder<Customer>, params: AdminCustomerDataParams) {
        const fromDate = params.fromDate;
        const toDate = params.toDate;

        if (fromDate)
            qb.andWhere('user_data.created_at >= :from', { from: `${fromDate} 00:00:00` });

        if (toDate)
            qb.andWhere('user_data.created_at <= :to', { to: `${toDate} 23:59:59` });
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
        if (params.toDate || params.toDate)
            GeneralQueries.addDateRangeFilter(queryBuilder, 'user_data', { fromDate: params.toDate, toDate: params.toDate }, 'created_at');
        return await queryBuilder.getMany();
    }
}