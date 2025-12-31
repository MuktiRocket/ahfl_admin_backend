import express, { Application, Express, Router, Request, Response, NextFunction } from 'express';
import { Controller } from './controller';
import cors from 'cors';
import { LogHandler } from '../middlewares/log-handler';
import { GErrorHandler } from '../middlewares/g-error-handler';
import { OpenApiService } from '../services/open-api-service';

export enum ApiVersion {
    V1 = 'v1'
}

export abstract class Api {
    public abstract addRoutes(app: Express): void;
    protected controllers: Controller[] = [];
    
    protected beforeMiddleware(router: Router): void {
        router.use(cors());
        router.use(express.json());
        router.use(express.text());
        router.use(express.urlencoded({ extended: true }));
        router.use(LogHandler.middleware);
    }

    protected afterMiddleware(router: Router): void {
        router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            GErrorHandler.handleError(err, req, res, next);
        });
    }

    protected addNonControllerRoutes(app: Application, apiVersion: ApiVersion): void {
        const router: Router = Router();
        const path = `/api/docs/${apiVersion}`;
        OpenApiService.applySwaggerUi(app, router, path);
        app.use('/public', express.static('public'));
        router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            GErrorHandler.handleError(err, req, res, next);
        });
    }
}