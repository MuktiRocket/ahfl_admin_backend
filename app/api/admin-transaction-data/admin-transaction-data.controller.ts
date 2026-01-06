import { Request, Response } from "express";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminTransactionDataParams, AdminTransactionDataService } from "./admin-transaction-data.service";

export class AdminTransactionDataController extends Controller {
    protected name: string = "admin-transaction";

    protected createRoutes(): void {        
        this.authenticatedAdminRoute(RequestMethod.GET, '/getTransactionData', this.getAllTransactions.bind(this), { encrypt: false });
    }

    private async getAllTransactions(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params = req.query as AdminTransactionDataParams;

        const [transactionData, totalCount] = await AdminTransactionDataService.getAllTransactionData(params, paginationParams);
        res.json({ totalCount, data: transactionData.map(p => p.getAdminTransactionData()) });
    }
}