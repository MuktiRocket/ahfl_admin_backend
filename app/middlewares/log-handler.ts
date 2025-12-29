import { Request, Response, NextFunction } from "express";
import { randomUUID as uuid4 } from 'crypto';
import { requestLogger, responseLogger } from "../utils/logger";
import { LogUtils } from "../utils/log-utils";
import { EventEmitter } from "events";

const IS_FULL_LOG_REQUIRED = true;
const LOGS_MAX_CHAR = 500;

export class LogHandler {
    public static middleware(req: Request, res: Response, next: NextFunction): void {
        const startTime = Date.now();
        req.headers['guid'] = uuid4();
        const query = JSON.parse(JSON.stringify(req.query));
        const body = JSON.parse(JSON.stringify(req.body));
        const headers = JSON.parse(JSON.stringify(req.headers));

        requestLogger.info(`${req.method} ${req.originalUrl}`, {
            query: LogUtils.secureSensitiveFields(query),
            body: LogUtils.secureSensitiveFields(body),
            headers: LogUtils.secureSensitiveFields(headers),
            ip: req.ip,
        });

        LogHandler.handleResponseFinish(req, res, startTime);

        // Capture the response body into res.locals to log it later
        const originalSend = res.send.bind(res);
        res.send = function (...args: [unknown]) {
            res.locals.body = args[0];
            return originalSend(...args);
        };
        return next();
    }

    private static handleResponseFinish(req: Request, res: Response, startTime: number): void {
        // Ensure response is logged only once by using 'once'
        EventEmitter.prototype.once.call(res, 'finish', () => {
            const responseTime = Date.now() - startTime;

            // Capture the status code & generated request unique id
            const statusCode = res.statusCode;
            const guid = req.headers['guid'];

            // Log the response details with the response body truncated to 500 characters
            const body = LogUtils.secureSensitiveFields(res.locals.body);
            const truncatedBody = (!IS_FULL_LOG_REQUIRED && body && typeof body === 'string' && body.length > LOGS_MAX_CHAR) ? body.substring(0, LOGS_MAX_CHAR) + '...' : body;

            responseLogger.info(`${req.method} ${req.originalUrl}`, {
                statusCode,
                guid,
                responseTime: LogUtils.formatResponseTime(responseTime),
                responseBody: truncatedBody || 'No body content',
            });
        });
    }
}
