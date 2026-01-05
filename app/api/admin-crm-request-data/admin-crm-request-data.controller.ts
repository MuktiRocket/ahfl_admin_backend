import { Request, Response } from "express";
import { ApiError, errorTypes } from "../../error/api-error";
import { GeneralQueries } from "../../queries/general-queries";
import { PostTransactionService } from "../../services/post-transaction-service";
import { DateHelper } from "../../utils/date-helper";
import { HeaderHelper } from "../../utils/header-helper";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminCRMRequestService } from "../admin-crm-request-data/admin-crm-request-data.service";

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
        this.authenticatedAdminRoute(RequestMethod.GET, '/getCrmData', this.getAllPayments.bind(this), { encrypt: false });
        // this.authenticatedAdminRoute(RequestMethod.POST, '/post-transaction', this.handlePostTransaction.bind(this), { encrypt: false });
        // this.authenticatedAdminRoute(RequestMethod.GET, '/download-csv', this.downloadPaymentsCsv.bind(this), { encrypt: false });
        // this.authenticatedAdminRoute(RequestMethod.POST, '/details', this.paymentDetails.bind(this), { encrypt: false });
    }

    private async getAllPayments(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params: AdminCRMRequestParams = req.query as any;

        const [crmData, totalCount] = await AdminCRMRequestService.getAllPayments(params, paginationParams);
        res.json({ totalCount, data: crmData.map(p => p.getAdminCrmRequest()) });
    }

    // private async paymentDetails(req: Request, res: Response): Promise<void> {
    //     const { id }: { id: string } = req.body;
    //     const payment = await GeneralQueries.getPaymentWithUserDetails('id', id);
    //     if (!payment)
    //         throw new ApiError(errorTypes.paymentNotFound);
    //     res.json(payment.getAdminPayment());
    // }

    // private async handlePostTransaction(req: Request, res: Response): Promise<void> {
    //     const { id }: { id: string } = req.body;
    //     const payment = await GeneralQueries.getPaymentWithUserDetails('id', id);

    //     if (!payment)
    //         throw new ApiError(errorTypes.paymentNotFound);

    //     if (!payment.postTransaction)
    //         await PostTransactionService.handleLmsPostTransaction(payment);
    //     payment.postTransaction = true;
    //     if (!['LAS', 'LAMF'].includes(payment.user.product.product)) {
    //         res.json(payment.getAdminPayment());
    //         return;
    //     }

    //     if (!payment.releaseLimit || !payment.fiftyFin) {
    //         const [releaseLimit, fiftyFin] = await PostTransactionService.handleReleaseLimitAndFiftyFin(payment);
    //         payment.releaseLimit = releaseLimit;
    //         payment.fiftyFin = fiftyFin;
    //     }

    //     res.json(payment.getAdminPayment());
    // }

    // private async downloadPaymentsCsv(req: Request, res: Response): Promise<void> {
    //     const params: AdminPaymentParams = req.query as any;

    //     if (params.from && params.to && !DateHelper.verifyDateRange(params.from, params.to))
    //         throw new ApiError(errorTypes.invalidParameters, { message: "Date range more than 1 year is not allow." });

    //     const payments = await AdminPaymentService.getAllPaymentsForCsv(params);
    //     const csvData = payments.map(p => p.getPaymentCsvData());

    //     const csv = Utils.csvGenerator(csvData);
    //     const fileName = Utils.getGeneratedFileName("payment", "csv");

    //     HeaderHelper.setCsvDownloadHeaders(res, fileName);
    //     res.send('\uFEFF' + csv);
    // }
}