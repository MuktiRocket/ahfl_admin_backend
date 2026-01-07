import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { TransactionData } from "../../models/TransactionData";
import { PaginationParams } from "../controller";

export interface AdminTransactionDataParams {
    query?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}

export class AdminTransactionDataService {
    private static applyCreatedAtFilter(qb: SelectQueryBuilder<TransactionData>, params: AdminTransactionDataParams) {
        const from = params.from;
        const to = params.to;

        if (from)
            qb.andWhere('payment_details.createdAt >= :from', { from: `${from} 00:00:00` });

        if (to)
            qb.andWhere('payment_details.createdAt <= :to', { to: `${to} 23:59:59` });
    }

    private static applyQueryFilter(queryBuilder: SelectQueryBuilder<TransactionData>, params: AdminTransactionDataParams) {
        if (!params.query) return;

        const q = `%${params.query}%`;

        queryBuilder.andWhere(
            new Brackets(qb => {
                qb.where('payment_details.customerId LIKE :q', { q })
                    .orWhere('payment_details.mobile LIKE :q', { q })
                    .orWhere('payment_details.orderId LIKE :q', { q })
                    .orWhere('payment_details.amount LIKE :q', { q })
                    .orWhere('payment_details.responseCode LIKE :q', { q })
                    .orWhere('payment_details.responseMsg LIKE :q', { q })
                    .orWhere('payment_details.responseStatus LIKE :q', { q })
                    .orWhere('payment_details.mode LIKE :q', { q })
                    .orWhere('payment_details.txnId LIKE :q', { q })
                    .orWhere('payment_details.loanAccountNumber LIKE :q', { q });
            })
        );
    }

    private static getQueryBuilder(params: AdminTransactionDataParams, manager: EntityManager = Database.manager): SelectQueryBuilder<TransactionData> {

        const queryBuilder = manager.createQueryBuilder(TransactionData, 'payment_details');

        this.applyCreatedAtFilter(queryBuilder, params);

        this.applyQueryFilter(queryBuilder, params);

        queryBuilder.orderBy('payment_details.createdAt', 'DESC');

        return queryBuilder;
    }

    public static async getAllTransactionData(params: AdminTransactionDataParams, paginationParams: PaginationParams): Promise<[TransactionData[], number]> {
        const queryBuilder = this.getQueryBuilder(params);
        return await queryBuilder.skip(paginationParams.offset).take(paginationParams.limit).getManyAndCount();
    }

    public static async getAllCustomersForCsv(params: AdminTransactionDataParams): Promise<TransactionData[]> {
        const queryBuilder = this.getQueryBuilder(params);
        return await queryBuilder.getMany();
    }
}