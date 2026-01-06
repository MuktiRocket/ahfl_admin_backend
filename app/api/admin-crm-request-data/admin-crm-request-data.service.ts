import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { CrmRequestData } from "../../models/CrmRequestData";
import { GeneralQueries } from "../../queries/general-queries";
import { PaginationParams } from "../controller";

export interface AdminCRMRequestParams {
    query?: string;
    from?: string;
    to?: string;
}

export class AdminCRMRequestService {

    private static applyCreatedAtFilter(qb: SelectQueryBuilder<CrmRequestData>, params: AdminCRMRequestParams) {
        const from = params.from;
        const to = params.to;

        if (from)
            qb.andWhere('crm_request_data.createdAt >= :from', { from: `${from} 00:00:00` });

        if (to)
            qb.andWhere('crm_request_data.createdAt <= :to', { to: `${to} 23:59:59` });
    }

    private static applyQueryFilter(queryBuilder: SelectQueryBuilder<CrmRequestData>, params: AdminCRMRequestParams) {
        if (!params.query) return;

        const q = `%${params.query}%`;

        queryBuilder.andWhere(
            new Brackets(qb => {
                qb.where('crm_request_data.firstName LIKE :q', { q })
                    .orWhere('crm_request_data.lastName LIKE :q', { q })
                    .orWhere('crm_request_data.clientId LIKE :q', { q })
                    .orWhere('crm_request_data.contactEmailId LIKE :q', { q })
                    .orWhere('crm_request_data.contactMobileNo LIKE :q', { q })
                    .orWhere('crm_request_data.probCategory LIKE :q', { q })
                    .orWhere('crm_request_data.probType LIKE :q', { q })
                    .orWhere('crm_request_data.probSummary LIKE :q', { q })
                    .orWhere('crm_request_data.description LIKE :q', { q })
                    .orWhere('crm_request_data.source LIKE :q', { q })
                    .orWhere('crm_request_data.type LIKE :q', { q })
                    .orWhere('crm_request_data.source_AppId LIKE :q', { q })
                    .orWhere('crm_request_data.probItem LIKE :q', { q })
                    .orWhere('crm_request_data.changedMobile LIKE :q', { q })
                    .orWhere('crm_request_data.ticketId LIKE :q', { q });
            })
        );
    }

    private static getQueryBuilder(params: AdminCRMRequestParams, manager: EntityManager = Database.manager): SelectQueryBuilder<CrmRequestData> {

        const queryBuilder = manager.createQueryBuilder(CrmRequestData, 'crm_request_data');

        this.applyCreatedAtFilter(queryBuilder, params);

        this.applyQueryFilter(queryBuilder, params);

        queryBuilder.orderBy('crm_request_data.createdAt', 'DESC');

        return queryBuilder;
    }

    public static async getAllCrmData(params: AdminCRMRequestParams, paginationParams: PaginationParams): Promise<[CrmRequestData[], number]> {
        const queryBuilder = this.getQueryBuilder(params);
        return await queryBuilder.skip(paginationParams.offset).take(paginationParams.limit).getManyAndCount();
    }
    public static async getAllCrmRequestsForCsv(params: AdminCRMRequestParams): Promise<CrmRequestData[]> {
        const queryBuilder = this.getQueryBuilder(params);

        GeneralQueries.addDateRangeFilter(queryBuilder, 'crm_request_data', { fromDate: params.from, toDate: params.to });

        return await queryBuilder.getMany();
    }
}
