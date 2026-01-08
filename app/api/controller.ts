import express, { Router, RequestHandler, Request, Response, NextFunction } from "express";
import { RequestMethod } from "./request-method";
import { GErrorHandler } from "../middlewares/g-error-handler";
import { OpenApiService } from "../services/open-api-service";
import { AuthHandler } from "../middlewares/auth-handler";
import { UserObjectIncludes } from "../queries/user-queries";

export interface RouteOptions {
    validate?: boolean;
    userObjectIncludes?: UserObjectIncludes[];
    encrypt?: boolean;
}

interface FullRouteOpions extends RouteOptions {
    isPublic?: boolean;
    routeType?: "guestUserRoute" | "authUserRoute" | "authAdminUserRoute";
}
export const DEFAULT_ADMIN_PAGINATION_LIMIT = 10;
export interface PaginationParams {
    limit: number;
    offset: number;
}
export abstract class Controller {
    private router: express.Router;
    protected abstract name: string;
    protected abstract createRoutes(): void;

    constructor() {
        this.router = express.Router();
    }

    public registerRoutes(parentRouter: Router): void {
        this.createRoutes();
        parentRouter.use(`/${this.name}`, this.router);
    }

    protected publicRoute(method: RequestMethod, path: string, handler: RequestHandler, options: RouteOptions = {}) {
        this.genericRoute(method, path, handler, { ...options, isPublic: true });
    }

    protected guestUserRoute(method: RequestMethod, path: string, handler: RequestHandler, options: RouteOptions = {}) {
        this.genericRoute(method, path, handler, { ...options, routeType: "guestUserRoute" });
    }

    protected authenticatedUserRoute(method: RequestMethod, path: string, handler: RequestHandler, options: RouteOptions = {}) {
        this.genericRoute(method, path, handler, { ...options, routeType: "authUserRoute" });
    }
    protected authenticatedAdminRoute(method: RequestMethod, path: string, handler: RequestHandler, options: RouteOptions = {}) {
        this.genericRoute(method, path, handler, { ...options, routeType: "authAdminUserRoute" });
    }
    private genericRoute(method: RequestMethod, path: string, handler: RequestHandler, options: FullRouteOpions) {
        const errorProofHandler = this.getErrorProofHandler(handler);
        const beforeHandlers: RequestHandler[] = [];
        if (!options.isPublic && options.routeType == "guestUserRoute") {
            beforeHandlers.push(AuthHandler.authentiateGuestUser);
        }

        if (!options.isPublic && options.routeType == "authUserRoute")
            beforeHandlers.push(AuthHandler.authenticateUser(options.userObjectIncludes || []));

        if (!options.isPublic && options.routeType == "authAdminUserRoute")
            beforeHandlers.push(AuthHandler.authenticateUser(options.userObjectIncludes || []));

        // validate by default!
        if (options.validate !== false) {
            beforeHandlers.push(this.validateRequest(method, path));
        }
        const routeHandlers = beforeHandlers.concat(errorProofHandler);
        this.handleRequest(method, path, routeHandlers);
    }

    private handleRequest(method: RequestMethod, path: string, handlers: RequestHandler[]) {
        switch (method) {
            case RequestMethod.GET:
                this.router.get(path, handlers);
                break;
            case RequestMethod.POST:
                this.router.post(path, handlers);
                break;
            case RequestMethod.PUT:
                this.router.put(path, handlers);
                break;
            case RequestMethod.PATCH:
                this.router.patch(path, handlers);
                break;
            case RequestMethod.DELETE:
                this.router.delete(path, handlers);
                break;
            case RequestMethod.OPTIONS:
                this.router.options(path, handlers);
                break;
            default:
                this.router.get(path, handlers);
        }
    }

    private getErrorProofHandler(handler: RequestHandler): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await handler(req, res, next);
            } catch (error: unknown) {
                GErrorHandler.handleError(error, req, res, next);
            }
        };
    }

    private validateRequest(method: RequestMethod, path: string): express.RequestHandler {
        const qualifiedPath: string = `/${this.name}${path}`;
        return OpenApiService.validate(method, qualifiedPath);
    }
}
