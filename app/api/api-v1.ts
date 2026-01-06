import { Express, Router } from 'express';
import { AdminAuthController } from "./admin-auth/admin-auth-controller";
import { AdminCRMRequestController } from './admin-crm-request-data/admin-crm-request-data.controller';
import { AdminCustomerDataController } from './admin-customer-data/admin-customer-data-controller';
import { AdminTransactionDataController } from './admin-transaction-data/admin-transaction-data.controller';
import { Api, ApiVersion } from "./api";
import { HealthController } from "./health/health-controller";
// import { JioController } from "./jio/jio-controller";

export class ApiV1 extends Api {

    constructor() {
        super();
        this.controllers.push(new HealthController());
        this.controllers.push(new AdminAuthController());
        this.controllers.push(new AdminCRMRequestController());
        this.controllers.push(new AdminTransactionDataController());
        this.controllers.push(new AdminCustomerDataController());
    }

    public addRoutes(app: Express): void {
        const controllerRouter: Router = Router();

        this.beforeMiddleware(controllerRouter);
        this.controllers.forEach((c) => c.registerRoutes(controllerRouter));
        this.afterMiddleware(controllerRouter);

        app.use(`/api/${ApiVersion.V1}`, controllerRouter);

        this.addNonControllerRoutes(app, ApiVersion.V1);
    }
}