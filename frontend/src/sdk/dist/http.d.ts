import { AxiosRequestConfig } from 'axios';
import { SBTCPayConfig } from './types';
export declare class HTTPClient {
    private axiosInstance;
    private config;
    constructor(config?: SBTCPayConfig);
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    setApiKey(apiKey: string): void;
}
