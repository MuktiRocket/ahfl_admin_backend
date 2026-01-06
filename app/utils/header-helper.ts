import { RawAxiosRequestHeaders } from "axios";
import type { Response } from "express";

/**
 * Interface for custom headers used in Jio Finance and Encore APIs.
 */
export interface JFLHeader extends RawAxiosRequestHeaders {
    entityId?: string;
    client_id?: string;
    Cookie?: string;
}

/**
 * Utility class for generating HTTP headers for various API integrations.
 */
export class HeaderHelper {
    private static buildAttachmentContentDisposition(fileName: string, defaultExtension: string): string {
        const normalizedExtension = defaultExtension.startsWith(".") ? defaultExtension : `.${defaultExtension}`;
        const escapedExtension = normalizedExtension.replace(/\./g, "\\.");
        const extensionRegex = new RegExp(`${escapedExtension}$`, "i");
        const nameWithExt = extensionRegex.test(fileName) ? fileName : `${fileName}${normalizedExtension}`;

        // Prevent header injection / odd chars in the ASCII fallback
        const asciiFallback = nameWithExt
            .replace(/[\r\n"]/g, "")         // strip CR/LF and quotes
            .replace(/[^\x20-\x7E]+/g, "_"); // replace non-ASCII with underscore

        return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(nameWithExt)}`;
    }

    public static setCsvDownloadHeaders(res: Response, fileName: string): void {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", this.buildAttachmentContentDisposition(fileName, ".csv"));
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader("X-Content-Type-Options", "nosniff"); // small security hardening
    }
}
