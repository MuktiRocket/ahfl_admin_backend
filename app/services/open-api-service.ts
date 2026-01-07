import { OpenApiDocument, OpenApiValidator } from "express-openapi-validate";
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import { RequestMethod } from "../api/request-method";
import { Application, RequestHandler, Router } from "express";
import { Env } from "../utils/env";
import { readFileSync } from "fs";
import { logger } from "../utils/logger";

const API_DOCS_PATH = `./docs/openapi-v1-compiled.json`;

export class OpenApiService {
    private static openApiDocs: OpenApiDocument;
    private static options: SwaggerUiOptions;
    private static validator: OpenApiValidator;

    public static initialize(): void {
        OpenApiService.openApiDocs = JSON.parse(readFileSync(API_DOCS_PATH, 'utf-8'));
        OpenApiService.options = {
            customSiteTitle: "AHFL Backend",
            customfavIcon: "/public/favicon.ico",
            customCss: `
                .topbar {
                    display: none;
                }
                .swagger-ui {
                    margin-top: -30px;
                }
            `
        };
        OpenApiService.validator = new OpenApiValidator(OpenApiService.openApiDocs, {
            ajvOptions: {
                coerceTypes: true,
                formats: OpenApiService.customAjvFormat(),
                validateSchema: true
            }
        });
        logger.info('Open api service initialized successfully');
    }

    // The endpoint GET /api/docs/{version} is only valid for dev or localhost
    public static applySwaggerUi(app: Application, router: Router, path: string): void {
        const env = Env.ENV_NAME || 'dev';
        const isAllowed = ["dev", "localhost"].some((e) => e === env);
        if (isAllowed) {
            router.use(`/`, swaggerUi.serve, swaggerUi.setup(this.openApiDocs, this.options));
            app.use(path, router);
        }
    }

    public static validate(method: RequestMethod, qualifiedPath: string): RequestHandler {
        return OpenApiService.validator.validate(method, qualifiedPath);
    }

    private static customAjvFormat(): Record<string, RegExp> {
        return {
            uuid: OpenApiService.getUuidPattern(),
            email: OpenApiService.getEmailPattern(),
        };
    }

    private static getUuidPattern(): RegExp {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    }

    private static getEmailPattern(): RegExp {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    }
}