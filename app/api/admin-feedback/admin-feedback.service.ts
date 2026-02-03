import { Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Database } from "../../database";
import { Feedback } from "../../models/feedback";
import { GeneralQueries } from "../../queries/general-queries";
import { PaginationParams } from "../controller";

export interface AdminFeedbackParams {
    query?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
}

export class AdminFeedbackService {
    private static applyCreatedAtFilter(qb: SelectQueryBuilder<Feedback>, params: AdminFeedbackParams) {
        const fromDate = params.fromDate;
        const toDate = params.toDate;

        if (fromDate)
            qb.andWhere('feedback.created_at >= :from', { from: `${fromDate} 00:00:00` });

        if (toDate)
            qb.andWhere('feedback.created_at <= :to', { to: `${toDate} 23:59:59` });
    }

    private static applyQueryFilter(queryBuilder: SelectQueryBuilder<Feedback>, params: AdminFeedbackParams) {
        if (!params.query) return;

        const q = `%${params.query}%`;

        queryBuilder.andWhere(
            new Brackets(subQb => {
                subQb
                    .where('feedback.user_id LIKE :q', { q })
                    .orWhere('feedback.mobile LIKE :q', { q })
                    .orWhere('feedback.rating LIKE :q', { q })
                    .orWhere('feedback.comment LIKE :q', { q });
            })
        );
    }

    private static getQueryBuilder(params: AdminFeedbackParams, manager: EntityManager = Database.manager): SelectQueryBuilder<Feedback> {

        const queryBuilder = manager.createQueryBuilder(Feedback, 'feedback');

        this.applyCreatedAtFilter(queryBuilder, params);
        this.applyQueryFilter(queryBuilder, params);

        queryBuilder.orderBy('feedback.id', 'DESC');

        return queryBuilder;
    }

    public static async getAllFeedbackData(params: AdminFeedbackParams, paginationParams: PaginationParams): Promise<[Feedback[], number]> {
        const qb = this.getQueryBuilder(params);
        GeneralQueries.addDateRangeFilter(qb, 'feedback', { fromDate: params.fromDate, toDate: params.toDate }, 'created_at');
        return await qb.skip(paginationParams.offset).take(paginationParams.limit).getManyAndCount();
    }

    public static async getAllFeedbacksForCsv(params: AdminFeedbackParams): Promise<Feedback[]> {
        const queryBuilder = this.getQueryBuilder(params);

        GeneralQueries.addDateRangeFilter(queryBuilder, 'feedback', { fromDate: params.fromDate, toDate: params.toDate });

        return await queryBuilder.getMany();
    }
}