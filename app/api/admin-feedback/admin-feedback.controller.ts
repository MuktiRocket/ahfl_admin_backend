import { Request, Response } from "express";
import { Utils } from "../../utils/utils";
import { Controller, DEFAULT_ADMIN_PAGINATION_LIMIT, PaginationParams } from "../controller";
import { RequestMethod } from "../request-method";
import { AdminFeedbackParams, AdminFeedbackService } from "./admin-feedback.service";

export class AdminFeedbackController extends Controller {
    protected name: string = "admin-feedback";

    protected createRoutes(): void {
        this.authenticatedAdminRoute(RequestMethod.GET, '/list', this.getAllFeedbacks.bind(this), { encrypt: false });
    }

    private async getAllFeedbacks(req: Request, res: Response): Promise<void> {
        const paginationParams: PaginationParams = Utils.extractPaginationParams(req.query, DEFAULT_ADMIN_PAGINATION_LIMIT);
        const params = req.query as AdminFeedbackParams;

        const [customers, totalCount] = await AdminFeedbackService.getAllFeedbackData(params, paginationParams);
        res.json({ totalCount, data: customers.map(f => f.getAdminFeedbackData()) });
    }
}