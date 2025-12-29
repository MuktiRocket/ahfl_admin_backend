import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from "path";

const LOG_RETENTION_PERIOD = '30d';
const LOG_FOLDER_PATH = './logs';

class LoggerFactory {
    private static logTransports = [
        new transports.Console(),
        new DailyRotateFile({
            level: 'error',
            filename: path.join(LOG_FOLDER_PATH, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: LOG_RETENTION_PERIOD,
            zippedArchive: false,
        }),
        new DailyRotateFile({
            filename: path.join(LOG_FOLDER_PATH, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: LOG_RETENTION_PERIOD,
            zippedArchive: false,
        }),
    ];

    // eslint-disable-next-line
    private static getEmojiForStatusCode(statusCode: number): string {
        switch (statusCode) {
            // 2XX
            case 200: return '😉';
            case 201: return '🎉';
            case 204: return '🤐';
            // 3XX
            case 301: return '🔀';
            case 304: return '😏';
            // 4XX
            case 400: return '❗';
            case 401: return '🔒';
            case 403: return '🚷';
            case 404: return '❓';
            case 422: return '❌';
            case 429: return '🚫';
            // 5XX
            case 500: return '🔥';
            case 502: return '⚡';
            case 503: return '💤';
            case 504: return '⏳';
            default: return '❔';
        }
    }

    private static createLogFormat(type: 'default' | 'request' | 'response'): ReturnType<typeof format.printf> {
        switch (type) {
            case 'request':
                // eslint-disable-next-line
                return format.printf(({ timestamp, level, message, ...meta }) =>
                    `\n\n${timestamp} [REQUEST]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
                );
            case 'response':
                // eslint-disable-next-line
                return format.printf(({ timestamp, level, message, ...meta }) => {
                    const statusCode = Number(meta.statusCode) || 500;
                    const emoji = LoggerFactory.getEmojiForStatusCode(statusCode);
                    return `\n\n${timestamp} [RESP ${statusCode} ${emoji}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta).replace(/\\/g, '') : ''}`;
                });
            default:
                return format.printf(({ timestamp, level, message, ...meta }) =>
                    `\n\n${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
                );
        }
    }

    public static createLogger(type: 'default' | 'request' | 'response'): Logger {
        return createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
                this.createLogFormat(type)
            ),
            transports: this.logTransports,
            exceptionHandlers: [new DailyRotateFile({
                filename: path.join(LOG_FOLDER_PATH, 'exceptions-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: LOG_RETENTION_PERIOD,
                zippedArchive: false,
            })],
            rejectionHandlers: [new DailyRotateFile({
                filename: path.join(LOG_FOLDER_PATH, 'rejections-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: LOG_RETENTION_PERIOD,
                zippedArchive: false,
            })],
        });
    }
}

export const logger = LoggerFactory.createLogger("default");
export const requestLogger = LoggerFactory.createLogger("request");
export const responseLogger = LoggerFactory.createLogger("response");
