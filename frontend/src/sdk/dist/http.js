"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPClient = void 0;
const axios_1 = __importDefault(require("axios"));
class HTTPClient {
    constructor(config = {}) {
        this.config = {
            baseUrl: config.baseUrl || 'http://localhost:3000/api/v1',
            apiKey: config.apiKey,
            timeout: config.timeout || 10000,
            ...config
        };
        this.axiosInstance = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
            }
        });
        // Add response interceptor for error handling
        this.axiosInstance.interceptors.response.use((response) => response, (error) => {
            const apiError = {
                message: error.response?.data?.error || error.message || 'Unknown error occurred',
                status: error.response?.status,
                code: error.code
            };
            return Promise.reject(apiError);
        });
    }
    async get(url, config) {
        const response = await this.axiosInstance.get(url, config);
        return response.data;
    }
    async post(url, data, config) {
        const response = await this.axiosInstance.post(url, data, config);
        return response.data;
    }
    async put(url, data, config) {
        const response = await this.axiosInstance.put(url, data, config);
        return response.data;
    }
    async delete(url, config) {
        const response = await this.axiosInstance.delete(url, config);
        return response.data;
    }
    setApiKey(apiKey) {
        this.config.apiKey = apiKey;
        this.axiosInstance.defaults.headers.Authorization = `Bearer ${apiKey}`;
    }
}
exports.HTTPClient = HTTPClient;
