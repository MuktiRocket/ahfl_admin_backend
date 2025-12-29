import { Request, Response, NextFunction } from "express";
import { ApiError, errorTypes } from "../error/api-error";
import { ValidationError } from "express-openapi-validate";

export class GErrorHandler {
    public static handleError(err: Error | unknown, req: Request, res: Response, next: NextFunction): Response | void {
        if (err) {
            if (err instanceof ApiError) {
                const error = err as ApiError;
                return res.status(error.httpStatus).json(error.getBody());
            }
            if (err instanceof ValidationError) {
                const error = new ApiError(errorTypes.invalidParameters, { message: err.message, validateErrors: (err as ValidationError).data });
                return res.status(error.httpStatus).json(error.getBody());
            }
            const genericError = new ApiError(errorTypes.internalServerError, { err });
            return res.status(genericError.httpStatus).json(genericError.getBody());
        }
        return next(err);
    }
}