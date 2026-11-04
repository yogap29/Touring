import apiClient from './client';
import type { CategoryBreakdown, DashboardSummary, MonthlyTrend } from '../types';

export const dashboardService = {
  async getSummary(month?: string): Promise<DashboardSummary> {
    const params = month ? { month } : {};
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary', { params });
    return response.data;
  },

  async getCategoryBreakdown(month?: string): Promise<CategoryBreakdown[]> {
    const params = month ? { month } : {};
    const response = await apiClient.get<CategoryBreakdown[]>('/dashboard/category-breakdown', { params });
    return response.data;
  },

  async getMonthlyTrend(months = 6, toMonth?: string): Promise<MonthlyTrend[]> {
    const params: any = { months };
    if (toMonth) params.toMonth = toMonth;
    const response = await apiClient.get<MonthlyTrend[]>('/dashboard/monthly-trend', { params });
    return response.data;
  },
};
