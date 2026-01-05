import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { Database } from "../database";

type DateInput = string | Date;
export enum IntervalUnit {
    DAY = "DAY",
    MONTH = "MONTH",
    YEAR = "YEAR",
}

export interface DateRangeParams {
    fromDate?: DateInput;
    toDate?: DateInput;
}

export class GeneralQueries {
    /**
    * Adds a date filter:
    * - If both fromDate & toDate are provided -> DATE(col) BETWEEN :fromDate AND :toDate
    * - Else -> fallback to last {period} {unit} using MySQL DATE_SUB/CURDATE()
    */
    public static addDateRangeFilter<G extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<G>, alias: string, params: DateRangeParams = {}, fieldName: string = "createdAt", fallbackWindow: { period: number, unit: IntervalUnit } = { period: 6, unit: IntervalUnit.MONTH }) {
        const { period, unit } = fallbackWindow;
        if (params.fromDate && params.toDate)
            queryBuilder.andWhere(`DATE(${alias}.${fieldName}) BETWEEN :fromDate AND :toDate`, { fromDate: params.fromDate, toDate: params.toDate });
        else
            queryBuilder.andWhere(`${alias}.${fieldName} >= DATE_SUB(CURDATE(), INTERVAL ${period} ${unit})`); // example: queryBuilder.andWhere(`user.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`);
    }
}
