import { Request, Response } from "express";
import { ApiError, errorTypes } from "../../error/api-error";
import { DateHelper } from "../../utils/date-helper";
import { HeaderHelper } from "../../utils/header-helper";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminAuditTrailParams, AdminAuditTrailService } from "./admin-audit.service";

export class AdminAuditController extends Controller {
    protected name: string = "admin-audit";

    protected createRoutes(): void {
        this.authenticatedAdminRoute(RequestMethod.GET, '/list', this.getAuditTrail.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.GET, '/download-csv', this.downloadAuditTrailCsv.bind(this), { encrypt: false });
    }

    private async getAuditTrail(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params = req.query as AdminAuditTrailParams;

        const [customers, totalCount] = await AdminAuditTrailService.getAuditTrailData(params, paginationParams);
        res.json({ totalCount, data: customers.map(a => a.getAdminAuditTrailData()) });
    }

    private async downloadAuditTrailCsv(req: Request, res: Response): Promise<void> {
        const params: AdminAuditTrailParams = req.query;

        if (params.from && params.to && !DateHelper.verifyDateRange(params.from, params.to))
            throw new ApiError(errorTypes.invalidParameters, { message: "Date range more than 1 year is not allow." });

        const customers = await AdminAuditTrailService.AuditTrailsForCsv(params);
        const csvData = customers.map(c => c.getAuditTrailCsvData());
        const csv = Utils.csvGenerator(csvData);
        const fileName = Utils.getGeneratedFileName("getAuditTrailData", "csv");

        HeaderHelper.setCsvDownloadHeaders(res, fileName);
        res.send('\uFEFF' + csv);
    }
}