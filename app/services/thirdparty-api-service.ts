import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";
import { logger } from "../utils/logger";

interface Request {
    method: "get" | "post" | "put" | "patch" | "delete";
    url: string;
    headers: RawAxiosRequestHeaders;
    data?: unknown;
}

export class ThirdPartyApiService {
    public static async sendRequest<G>({ method, url, headers, data }: Request): Promise<G> {
        const dataOrParams = ["get", "delete"].includes(method) ? "params" : "data";
        const axiosRequest: AxiosRequestConfig<G> = { method, url, headers, [dataOrParams]: data };

        logger.info(`${method.toUpperCase()} ${url} :: [ThirdPartyRequest] :: `, axiosRequest);
        return await axios.request<G>(axiosRequest)
            .then((res) => {
                logger.info(`${method.toUpperCase()} ${url} :: [ThirdPartyResponse] :: `, { Response: res.data });
                return res.data;
            })
            .catch((err) => {
                const LogError = {
                    error: err?.response?.data || err?.response || err?.message
                };
                logger.error(`${method.toUpperCase()} ${url} :: [ThirdPartyError] :: `, LogError);
                throw err.response?.data || err.response;
            });
    }

    public static getBasicAuthHeaders(username: string, password: string): RawAxiosRequestHeaders {
        const encodedAuthToken = Buffer.from(`${username}:${password}`).toString("base64");
        const headers: RawAxiosRequestHeaders = {
            Authorization: `Basic ${encodedAuthToken}`
        };
        return headers;
    }
}
