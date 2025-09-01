import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { APIError, SBTCPayConfig } from './types';

export class HTTPClient {
  private axiosInstance: AxiosInstance;
  private config: SBTCPayConfig;

  constructor(config: SBTCPayConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3000/api/v1',
      apiKey: config.apiKey,
      timeout: config.timeout || 10000,
      ...config
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
      }
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: APIError = {
          message: (error.response?.data as any)?.error || error.message || 'Unknown error occurred',
          status: error.response?.status,
          code: error.code
        };
        return Promise.reject(apiError);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  public setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.axiosInstance.defaults.headers.Authorization = `Bearer ${apiKey}`;
  }
}