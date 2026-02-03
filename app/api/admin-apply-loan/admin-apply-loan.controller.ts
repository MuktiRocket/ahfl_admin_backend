import { Request, Response } from "express";
import { HeaderHelper } from "../../utils/header-helper";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminApplyLoanParams, AdminApplyLoanService } from "./admin-apply-loan.service";

export class AdminApplyLoanController extends Controller {
    protected name: string = "admin-apply-loan";

    protected createRoutes(): void {
        this.authenticatedAdminRoute(RequestMethod.GET, '/list', this.getAllloans.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.GET, '/download-csv', this.downloadCsv.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.POST, '/details', this.getLoanDetails.bind(this), { encrypt: false });
    }

    private async getAllloans(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params = req.query as AdminApplyLoanParams;

        const [leadData, totalCount] = await AdminApplyLoanService.getAllLoanData(params, paginationParams);
        res.json({ totalCount, data: leadData.map(l => l.getAdminApplyLoanData()) });
    }

    private async downloadCsv(req: Request, res: Response): Promise<void> {
        const params = req.query as AdminApplyLoanParams;
        const [leadData] = await AdminApplyLoanService.getAllLoanData(params, { offset: 0, limit: 10000 });
        const csvRows = leadData.map(p => p.getApplyLoanCsvData());
        const csv = Utils.csvGenerator(csvRows);
        HeaderHelper.setCsvDownloadHeaders(res, 'lead_data.csv');
        res.send(csv);
    }

    private async getLoanDetails(req: Request, res: Response): Promise<void> {
        const { id }: { id: string } = req.body;
        const leadDetail = await AdminApplyLoanService.getLoanDetails('id', id);
        if (!leadDetail) {
            res.status(404).json({ error: 'Lead not found' });
            return;
        }
        res.json(leadDetail.getAdminApplyLoanData());
    }
}
