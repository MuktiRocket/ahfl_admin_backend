import { Env } from "./env";

export class Utils {
    public static randomCodeGenerator(length = 6, isAlphaNumeric = false): string {
        let characters = '1234567890'; // only numeric characters
        if (isAlphaNumeric)
            characters = `ABCDEFGHJKLMNPQRSTUVWXYZ${characters}`;

        let code = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }
        return code;
    }

    public static getCurrentISTDateTime(): Date {
        const currentDateTime = new Date();
        const utcTime = currentDateTime.getTime();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDateTime = new Date(utcTime + istOffset);
        return istDateTime;
    }

    public static normalizeDate(date?: string): string | undefined {
        if (!date) return undefined;

        // already ISO
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

        // DD-MM-YYYY → YYYY-MM-DD
        const [dd, mm, yyyy] = date.split('-');
        return `${yyyy}-${mm}-${dd}`;
    }

    public static getEmtpyIfNullish(text: string | null | undefined): string {
        return text ?? "";
    }
    public static extractPaginationParams(params: any, defaultLimit: number = 5) {
        return {
            limit: Number(params.limit) || defaultLimit,
            offset: Number(params.offset) || 0
        };
    }
    public static csvGenerator<G extends Record<string, any>>(data: G[], header?: (keyof G)[]): string {
        if (!header && data.length === 0)
            return "";

        if (!header)
            header = Object.keys(data[0]) as (keyof G)[];

        const escapeCSV = (value: unknown): string => {
            if (value === null || value === undefined)
                return "";

            const str = String(value);
            if (/[",\n]/.test(str))
                return `"${str.replace(/"/g, '""')}"`;

            return str;
        };

        if (header && data.length === 0)
            return [(header as string[]).map(escapeCSV).join(",")].join("\n");

        const rows = data.map(row => (header as string[]).map(field => escapeCSV(row[field])).join(","));
        return [(header as string[]).map(escapeCSV).join(","), ...rows].join("\n");
    }
    public static getGeneratedFileName(fileName: string, extension: string): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 for month, pad to 2 digits
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        // Concatenate directly
        const formattedTimestamp = `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;

        if (Env.ENV_NAME === 'prod') {
            return `${fileName}_${formattedTimestamp}.${extension}`;
        } else {
            return `${fileName}_${formattedTimestamp}_${Env.ENV_NAME}.${extension}`;
        }
    }
}