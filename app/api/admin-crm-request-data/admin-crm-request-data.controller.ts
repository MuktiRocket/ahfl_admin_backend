import { Request, Response } from "express";
import { ApiError, errorTypes } from "../../error/api-error";
import { GeneralQueries } from "../../queries/general-queries";
import { DateHelper } from "../../utils/date-helper";
import { HeaderHelper } from "../../utils/header-helper";
import { Utils } from "../../utils/utils";
import { AdminCRMRequestService } from "../admin-crm-request-data/admin-crm-request-data.service";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";

export interface AdminCRMRequestParams {
    query?: string;
    from?: string;
    to?: string;
}

export class AdminCRMRequestController extends Controller {
    protected name: string = "admin-crm";

    protected createRoutes(): void {
        /**
         * Payments routes
        */
        this.authenticatedAdminRoute(RequestMethod.GET, '/crm-requests', this.getAllCrmRequests.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.GET, '/download-csv', this.downloadCrmRequestsCsv.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.POST, '/details', this.crmRequestDetails.bind(this), { encrypt: false });
    }

    private async getAllCrmRequests(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params: AdminCRMRequestParams = req.query;
        const [crmData, totalCount] = await AdminCRMRequestService.getAllCrmData(params, paginationParams);
        res.json({ totalCount, data: crmData.map(p => p.getAdminCrmRequest()) });
    }

    private async downloadCrmRequestsCsv(req: Request, res: Response): Promise<void> {
        const params: AdminCRMRequestParams = req.query;

        if (params.from && params.to && !DateHelper.verifyDateRange(params.from, params.to))
            throw new ApiError(errorTypes.invalidParameters, { message: "Date range more than 1 year is not allow." });

        const payments = await AdminCRMRequestService.getAllCrmRequestsForCsv(params);
        const csvData = payments.map(p => p.getCrmCsvData());
        const csv = Utils.csvGenerator(csvData);
        const fileName = Utils.getGeneratedFileName("getCrmData", "csv");

        HeaderHelper.setCsvDownloadHeaders(res, fileName);
        res.send('\uFEFF' + csv);
    }

    private async crmRequestDetails(req: Request, res: Response): Promise<void> {
        const { id }: { id: string } = req.body;
        const crmDetail = await GeneralQueries.getCrmDataWithUserDetails('id', id);
        if (!crmDetail)
            throw new ApiError(errorTypes.paymentNotFound);
        res.json(crmDetail.getAdminCrmRequest());
    }
}