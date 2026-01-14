import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { AuditTrail } from "../../models/audit-trail";
import { PaginationParams } from "../controller";

export interface AdminAuditTrailParams {
    query?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}

export class AdminAuditTrailService {
    private static applyCreatedAtFilter(qb: SelectQueryBuilder<AuditTrail>, params: AdminAuditTrailParams) {
        const from = params.from;
        const to = params.to;

        if (from)
            qb.andWhere('audit_trail.created_at >= :from', { from: `${from} 00:00:00` });

        if (to)
            qb.andWhere('audit_trail.created_at <= :to', { to: `${to} 23:59:59` });
    }

    private static applyQueryFilter(queryBuilder: SelectQueryBuilder<AuditTrail>, params: AdminAuditTrailParams) {
        if (!params.query) return;

        const q = `%${params.query}%`;

        queryBuilder.andWhere(
            new Brackets(subQb => {
                subQb
                    .where('audit_trail.user_id LIKE :q', { q })
                    .orWhere('audit_trail.mobile LIKE :q', { q })
                    .orWhere('audit_trail.rating LIKE :q', { q })
                    .orWhere('audit_trail.comment LIKE :q', { q });
            })
        );
    }

    private static getQueryBuilder(params: AdminAuditTrailParams, manager: EntityManager = Database.manager): SelectQueryBuilder<AuditTrail> {

        const queryBuilder = manager.createQueryBuilder(AuditTrail, 'audit_trail');

        this.applyCreatedAtFilter(queryBuilder, params);
        this.applyQueryFilter(queryBuilder, params);

        queryBuilder.orderBy('audit_trail.id', 'DESC');

        return queryBuilder;
    }

    public static async getAuditTrailData(params: AdminAuditTrailParams, paginationParams: PaginationParams): Promise<[AuditTrail[], number]> {
        const qb = this.getQueryBuilder(params);

        return await qb.skip(paginationParams.offset).take(paginationParams.limit).getManyAndCount();
    }

    public static async AuditTrailsForCsv(params: AdminAuditTrailParams): Promise<AuditTrail[]> {
        const queryBuilder = this.getQueryBuilder(params);

        // GeneralQueries.addDateRangeFilter(queryBuilder, 'crm_request_data', { fromDate: params.from, toDate: params.to });

        return await queryBuilder.andWhere('audit_trail.uid IS NOT NULL').getMany();
    }
}