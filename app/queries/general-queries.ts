import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { Database } from "../database";
import { CrmRequestData } from "../models/CrmRequestData";
import { Customer } from "../models/customer";
import { TransactionData } from "../models/TransactionData";

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
        console.log(fieldName)
        const { period, unit } = fallbackWindow;
        if (params.fromDate && params.toDate)
            queryBuilder.andWhere(`DATE(${alias}.${fieldName}) BETWEEN :fromDate AND :toDate`, { fromDate: params.fromDate, toDate: params.toDate });
        else
            queryBuilder.andWhere(`${alias}.${fieldName} >= DATE_SUB(CURDATE(), INTERVAL ${period} ${unit})`); // example: queryBuilder.andWhere(`user.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`);
    }

    public static async getCrmDataWithUserDetails(field: 'id', value: string): Promise<CrmRequestData | null> {
        const queryBuilder = Database.manager.createQueryBuilder(CrmRequestData, 'crm_request_data')
            .where(`crm_request_data.${field} = :value`, { value });
        const crmDetail = await queryBuilder.getOne();
        return crmDetail;
    }

    public static async getCustomerDetails(field: 'id', value: string): Promise<Customer | null> {
        const queryBuilder = Database.manager.createQueryBuilder(Customer, 'user_data')
            .where(`user_data.${field} = :value`, { value });
        const crmDetail = await queryBuilder.getOne();
        return crmDetail;
    }

    public static async getTransactionDetails(field: 'id', value: string): Promise<TransactionData | null> {
        const queryBuilder = Database.manager.createQueryBuilder(TransactionData, 'payment_details')
            .where(`payment_details.${field} = :value`, { value });
        const transactionDetail = await queryBuilder.getOne();
        return transactionDetail;
    }
}
