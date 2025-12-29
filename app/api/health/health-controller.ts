import { Request, Response } from 'express';
import { Controller } from "../controller";
import { RequestMethod } from "../request-method";
import moment from 'moment';

export class HealthController extends Controller {
    protected name: string = 'health';

    protected createRoutes(): void {
        this.publicRoute(RequestMethod.GET, '', this.getStatus.bind(this));
    }

    private async getStatus(_: Request, res: Response): Promise<void> {
        const date = moment().format();
        res.json({
            message: 'Congratulation! Your application is running successfully',
            serverTime: date
        });
    }
}
