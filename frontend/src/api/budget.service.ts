import apiClient from './client';
import type { Budget, UpsertBudgetPayload } from '../types';

export const budgetService = {
  async getAll(month?: string): Promise<Budget[]> {
    const params = month ? { month } : {};
    const response = await apiClient.get<Budget[]>('/budgets', { params });
    return response.data;
  },

  async upsert(payload: UpsertBudgetPayload): Promise<Budget> {
    const response = await apiClient.put<Budget>('/budgets', payload);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/budgets/${id}`);
    return response.data;
  },
};
