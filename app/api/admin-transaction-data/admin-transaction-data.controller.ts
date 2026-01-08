import { Request, Response } from "express";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminTransactionDataParams, AdminTransactionDataService } from "./admin-transaction-data.service";
import { DateHelper } from "../../utils/date-helper";
import { ApiError, errorTypes } from "../../error/api-error";
import { HeaderHelper } from "../../utils/header-helper";
import { GeneralQueries } from "../../queries/general-queries";

export class AdminTransactionDataController extends Controller {
    protected name: string = "admin-transaction";

    protected createRoutes(): void {
        this.authenticatedAdminRoute(RequestMethod.GET, '/transactions', this.getAllTransactions.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.GET, '/download-csv', this.downloadTransactionRequestsCsv.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.POST, '/details', this.transactionDetails.bind(this), { encrypt: false });
    }

    private async getAllTransactions(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params = req.query as AdminTransactionDataParams;

        const [transactionData, totalCount] = await AdminTransactionDataService.getAllTransactionData(params, paginationParams);
        res.json({ totalCount, data: transactionData.map(p => p.getAdminTransactionData()) });
    }

    private async downloadTransactionRequestsCsv(req: Request, res: Response): Promise<void> {
        const params: AdminTransactionDataParams = req.query;

        if (params.from && params.to && !DateHelper.verifyDateRange(params.from, params.to)) {
            throw new ApiError(errorTypes.invalidParameters, { message: "Date range more than 1 year is not allow." });
        }

        const customers = await AdminTransactionDataService.getAllCustomersForCsv(params);
        const csvData = customers.map(c => c.getTransactionCsvData());
        const csv = Utils.csvGenerator(csvData);
        const fileName = Utils.getGeneratedFileName("transaction", "csv");

        HeaderHelper.setCsvDownloadHeaders(res, fileName);
        res.send('\uFEFF' + csv);
    }

    private async transactionDetails(req: Request, res: Response): Promise<void> {
        const { id }: { id: string } = req.body;
        const transaction = await GeneralQueries.getTransactionDetails('id', id);
        if (!transaction) {
            throw new ApiError(errorTypes.transactionNotFound);
        }
        res.json(transaction.getAdminTransactionData());
    }
}