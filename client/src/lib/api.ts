import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// In development, use relative URLs to leverage Vite's proxy
// In production, use the full API URL from environment variable
const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? '/api/v1' 
  : import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

// Exponential backoff delay calculation
const getRetryDelay = (retryCount: number): number => {
  return RETRY_DELAY * Math.pow(2, retryCount);
};

// Check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors (no response received)
    return true;
  }
  
  // Retry on specific status codes
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return retryableStatusCodes.includes(error.response.status);
};

// Sleep helper for delays
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      timeout: 30000, // 30 seconds timeout
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling with retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { retryCount?: number };
        
        // Handle 401 unauthorized errors
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Initialize retry count
        config.retryCount = config.retryCount || 0;

        // Check if we should retry
        if (config.retryCount < MAX_RETRIES && isRetryableError(error)) {
          config.retryCount += 1;
          
          // Calculate delay with exponential backoff
          const delay = getRetryDelay(config.retryCount - 1);
          
          console.log(
            `Retrying request (${config.retryCount}/${MAX_RETRIES}) after ${delay}ms...`,
            config.url
          );

          // Wait before retrying
          await sleep(delay);

          // Retry the request
          return this.client(config);
        }

        // Max retries exceeded or non-retryable error
        if (config.retryCount >= MAX_RETRIES) {
          console.error(
            `Request failed after ${MAX_RETRIES} retries:`,
            config.url
          );
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: any) {
    return this.client.post('/auth/register', data);
  }

  async login(data: any) {
    return this.client.post('/auth/login', data);
  }

  // Products
  async getProducts(params?: any) {
    return this.client.get('/products', { params });
  }

  async getProduct(id: string) {
    return this.client.get(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.client.post('/products', data);
  }

  async updateProduct(id: string, data: any) {
    return this.client.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/products/${id}`);
  }

  // Purchases
  async createPurchase(data: any) {
    return this.client.post('/purchases', data);
  }

  async getPurchases(params?: any) {
    return this.client.get('/purchases', { params });
  }

  async deletePurchase(id: string) {
    return this.client.delete(`/purchases/${id}`);
  }

  // Sales
  async createSale(data: any) {
    return this.client.post('/sales', data);
  }

  async getSales(params?: any) {
    return this.client.get('/sales', { params });
  }

  async getSale(id: string) {
    return this.client.get(`/sales/${id}`);
  }

  async deleteSale(id: string) {
    return this.client.delete(`/sales/${id}`);
  }

  async downloadInvoicePDF(id: string) {
    return this.client.get(`/sales/${id}/invoice-pdf`, {
      responseType: 'blob',
    });
  }

  // Expenses
  async createExpense(data: any) {
    return this.client.post('/expenses', data);
  }

  async getExpenses(params?: any) {
    return this.client.get('/expenses', { params });
  }

  async deleteExpense(id: string) {
    return this.client.delete(`/expenses/${id}`);
  }

  // Reports
  async getSummary(params?: any) {
    return this.client.get('/reports/summary', { params });
  }

  async getTopProducts(params?: any) {
    return this.client.get('/reports/top-products', { params });
  }

  async getLowStock() {
    return this.client.get('/reports/low-stock');
  }

  // LLM
  async naturalLanguageQuery(query: string) {
    return this.client.post('/llm/nlq', { query });
  }

  async generateInsights(context: any) {
    return this.client.post('/llm/insights', { context });
  }

  async generateDashboardInsights(context: any) {
    return this.client.post('/llm/dashboard-insights', { context });
  }

  async generateReportsInsights(context: any, period: string) {
    return this.client.post('/llm/reports-insights', { context, period });
  }
}

export const api = new ApiClient();
