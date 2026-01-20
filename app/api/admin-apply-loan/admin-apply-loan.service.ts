import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { ApplyLoanData } from "../../models/apply-loan";
import { PaginationParams } from "../controller";

export interface AdminApplyLoanParams {
    query?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}

export class AdminApplyLoanService {
    private static applyCreatedAtFilter(qb: SelectQueryBuilder<ApplyLoanData>, params: AdminApplyLoanParams) {
        const from = params.from;
        const to = params.to;
        if (from)
            qb.andWhere('apply_loan_data.create_at >= :from', { from: `${from} 00:00:00` });
        if (to)
            qb.andWhere('apply_loan_data.create_at <= :to', { to: `${to} 23:59:59` });
    }

    private static applyQueryFilter(queryBuilder: SelectQueryBuilder<ApplyLoanData>, params: AdminApplyLoanParams) {
        if (!params.query) return;
        const q = `%${params.query}%`;
        queryBuilder.andWhere(
            new Brackets((qb) => {
                qb.where('apply_loan_data.contactMobileNo LIKE :q', { q })
                    .orWhere('apply_loan_data.lead_id LIKE :q', { q })
                    .orWhere('apply_loan_data.firstName LIKE :q', { q })
                    .orWhere('apply_loan_data.lastName LIKE :q', { q })
                    .orWhere(
                        "CONCAT(apply_loan_data.firstName, ' ', apply_loan_data.lastName) LIKE :q",
                        { q }
                    )
                    .orWhere('apply_loan_data.created_at LIKE :q', { q }); // ✅ FIXED
            })
        );
    }

    private static getQueryBuilder(params: AdminApplyLoanParams, manager: EntityManager = Database.manager): SelectQueryBuilder<ApplyLoanData> {
        const queryBuilder = manager.createQueryBuilder(ApplyLoanData, 'apply_loan_data');
        this.applyCreatedAtFilter(queryBuilder, params);
        this.applyQueryFilter(queryBuilder, params);
        queryBuilder.orderBy('apply_loan_data.id', 'ASC');
        return queryBuilder;
    }

    public static async getAllLoanData(params: AdminApplyLoanParams, paginationParams: PaginationParams): Promise<[ApplyLoanData[], number]> {
        const queryBuilder = this.getQueryBuilder(params);
        return await queryBuilder.skip(paginationParams.offset).take(paginationParams.limit).getManyAndCount();
    }

    public static async getLoanDetails(field: 'id', value: string): Promise<ApplyLoanData | null> {
        const queryBuilder = Database.manager.createQueryBuilder(ApplyLoanData, 'apply_loan_data')
            .where(`apply_loan_data.${field} = :value`, { value });
        const leadDetail = await queryBuilder.getOne();
        return leadDetail ?? null;
    }
}
