import { Request, Response } from "express";
import { ApiError, errorTypes } from "../../error/api-error";
import { GeneralQueries } from "../../queries/general-queries";
import { DateHelper } from "../../utils/date-helper";
import { HeaderHelper } from "../../utils/header-helper";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminCustomerDataParams, AdminCustomerDataService } from "./admin-customer-data-service";

export class AdminCustomerDataController extends Controller {
    protected name: string = "admin-customer";

    protected createRoutes(): void {
        this.authenticatedAdminRoute(RequestMethod.GET, '/customers-list', this.getAllCustomers.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.GET, '/download-csv', this.downloadCrmRequestsCsv.bind(this), { encrypt: false });
        this.authenticatedAdminRoute(RequestMethod.POST, '/details', this.customerDetails.bind(this), { encrypt: false });
    }

    private async getAllCustomers(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params = req.query as AdminCustomerDataParams;

        const [customers, totalCount] = await AdminCustomerDataService.getAllCustomerData(params, paginationParams);
        res.json({ totalCount, data: customers.map(c => c.getAdminCustomerData()) });
    }

    private async downloadCrmRequestsCsv(req: Request, res: Response): Promise<void> {
        const params: AdminCustomerDataParams = req.query;

        if (params.from && params.to && !DateHelper.verifyDateRange(params.from, params.to))
            throw new ApiError(errorTypes.invalidParameters, { message: "Date range more than 1 year is not allow." });

        const customers = await AdminCustomerDataService.getAllCustomersForCsv(params);
        const csvData = customers.map(c => c.getCustomerCsvData());
        const csv = Utils.csvGenerator(csvData);
        const fileName = Utils.getGeneratedFileName("getCustomerData", "csv");

        HeaderHelper.setCsvDownloadHeaders(res, fileName);
        res.send('\uFEFF' + csv);
    }

    private async customerDetails(req: Request, res: Response): Promise<void> {
        const { id }: { id: string } = req.body;
        const customer = await GeneralQueries.getCustomerDetails('id', id);
        if (!customer)
            throw new ApiError(errorTypes.paymentNotFound);
        res.json(customer.getAdminCustomerData());
    }
}