import { Server as HTTPServer } from "http";
import { Express, Router } from 'express';
import { Api, ApiVersion } from "./api";
import { HealthController } from "./health/health-controller";
import { JioController } from "./jio/jio-controller";

export class ApiV1 extends Api {

    constructor() {
        super();
        this.controllers.push(new HealthController());
        this.controllers.push(new JioController());
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