import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { Lead } from "../../models/lead";
import { PaginationParams } from "../controller";

export interface AdminLeadDataParams {
    query?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}

export class AdminLeadService {
    private static applyCreatedAtFilter(qb: SelectQueryBuilder<Lead>, params: AdminLeadDataParams) {
        const from = params.from;
        const to = params.to;
        if (from)
            qb.andWhere('top_up_apply_loan_data.create_at >= :from', { from: `${from} 00:00:00` });
        if (to)
            qb.andWhere('top_up_apply_loan_data.create_at <= :to', { to: `${to} 23:59:59` });
    }

    private static applyQueryFilter(queryBuilder: SelectQueryBuilder<Lead>, params: AdminLeadDataParams) {
        if (!params.query) return;
        const q = `%${params.query}%`;
        queryBuilder.andWhere(
            new Brackets(qb => {
                qb.where('top_up_apply_loan_data.mobile_number LIKE :q', { q })
                    .orWhere('top_up_apply_loan_data.email_id LIKE :q', { q })
                    .orWhere('top_up_apply_loan_data.name LIKE :q', { q })
                    .orWhere('top_up_apply_loan_data.lead_id LIKE :q', { q });
            })
        );
    }

    private static getQueryBuilder(params: AdminLeadDataParams, manager: EntityManager = Database.manager): SelectQueryBuilder<Lead> {
        const queryBuilder = manager.createQueryBuilder(Lead, 'top_up_apply_loan_data');
        this.applyCreatedAtFilter(queryBuilder, params);
        this.applyQueryFilter(queryBuilder, params);
        queryBuilder.orderBy('top_up_apply_loan_data.id', 'ASC');
        return queryBuilder;
    }

    public static async getAllLeadData(params: AdminLeadDataParams, paginationParams: PaginationParams): Promise<[Lead[], number]> {
        const queryBuilder = this.getQueryBuilder(params);
        return await queryBuilder.skip(paginationParams.offset).take(paginationParams.limit).getManyAndCount();
    }

    public static async getLeadDetails(field: 'id', value: string): Promise<Lead | null> {
        const queryBuilder = Database.manager.createQueryBuilder(Lead, 'top_up_apply_loan_data')
            .where(`top_up_apply_loan_data.${field} = :value`, { value });
        const leadDetail = await queryBuilder.getOne();
        return leadDetail ?? null;
    }
}
