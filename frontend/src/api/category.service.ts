import apiClient from './client';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types';

export const categoryService = {
  async getAll(type?: string): Promise<Category[]> {
    const params = type ? { type } : {};
    const response = await apiClient.get<Category[]>('/categories', { params });
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const response = await apiClient.post<Category>('/categories', payload);
    return response.data;
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const response = await apiClient.patch<Category>(`/categories/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/categories/${id}`);
    return response.data;
  },
};
