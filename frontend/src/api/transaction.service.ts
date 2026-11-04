import apiClient from './client';
import type {
  CreateTransactionPayload,
  PaginatedTransactions,
  Transaction,
  TransactionFilter,
  UpdateTransactionPayload,
} from '../types';

export const transactionService = {
  async getAll(filter: TransactionFilter = {}): Promise<PaginatedTransactions> {
    const params: any = {};
    if (filter.month) params.month = filter.month;
    if (filter.type) params.type = filter.type;
    if (filter.categoryId) params.categoryId = filter.categoryId;
    if (filter.from) params.from = filter.from;
    if (filter.to) params.to = filter.to;
    if (filter.page) params.page = filter.page;
    if (filter.limit) params.limit = filter.limit;

    const response = await apiClient.get<PaginatedTransactions>('/transactions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transactions', payload);
    return response.data;
  },

  async update(id: string, payload: UpdateTransactionPayload): Promise<Transaction> {
    const response = await apiClient.patch<Transaction>(`/transactions/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/transactions/${id}`);
    return response.data;
  },
};
