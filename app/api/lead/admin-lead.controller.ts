import { Request, Response } from "express";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminLeadDataParams, AdminLeadService } from "./admin-lead.service";
import { HeaderHelper } from "../../utils/header-helper";

export class AdminLeadController extends Controller {
    protected name: string = "admin-lead";

    protected createRoutes(): void {
        this.authenticatedAdminRoute(RequestMethod.GET, '/leads', this.getAllLeads.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.GET, '/leads/download-csv', this.downloadCsv.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.POST, '/details', this.getLeadDetails.bind(this), { encrypt: false });
    }

    private async getAllLeads(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params = req.query as AdminLeadDataParams;

        const [leadData, totalCount] = await AdminLeadService.getAllLeadData(params, paginationParams);
        res.json({ totalCount, data: leadData.map(p => p.getAdminLeadData()) });
    }

    private async downloadCsv(req: Request, res: Response): Promise<void> {
        const params = req.query as AdminLeadDataParams;
        const [leadData] = await AdminLeadService.getAllLeadData(params, { offset: 0, limit: 10000 });
        const csvRows = leadData.map(p => p.getLeadCsvData());
        const csv = Utils.csvGenerator(csvRows);
        HeaderHelper.setCsvDownloadHeaders(res, 'lead_data.csv');
        res.send(csv);
    }

    private async getLeadDetails(req: Request, res: Response): Promise<void> {
        const { id }: { id: string } = req.body;
        const leadDetail = await AdminLeadService.getLeadDetails('id', id);
        if (!leadDetail) {
            res.status(404).json({ error: 'Lead not found' });
            return;
        }
        res.json(leadDetail.getAdminLeadData());
    }
}
