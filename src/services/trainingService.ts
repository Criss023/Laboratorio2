// src/services/trainingService.ts
import { apiClient } from './api';
import type { Training, CreateTrainingDto, UpdateTrainingDto, PaginatedResponse } from '../types';

export interface TrainingFilters {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const trainingService = {
  getAll: async (filters: TrainingFilters = {}): Promise<PaginatedResponse<Training>> => {
    const params = new URLSearchParams();
    if (filters.search)   params.set('q', filters.search);
    if (filters.status)   params.set('status', filters.status);
    if (filters.page)     params.set('_page', String(filters.page));
    if (filters.pageSize) params.set('_limit', String(filters.pageSize));

    const response = await apiClient.get<Training[]>(`/trainings?${params}`);
    const total = parseInt(response.headers['x-total-count'] || '0', 10);

    return {
      data: response.data,
      total,
      page: filters.page || 1,
      pageSize: filters.pageSize || 10,
      totalPages: Math.ceil(total / (filters.pageSize || 10)),
    };
  },

  getById: async (id: number): Promise<Training> => {
    const response = await apiClient.get<Training>(`/trainings/${id}`);
    return response.data;
  },

  create: async (data: CreateTrainingDto): Promise<Training> => {
    const response = await apiClient.post<Training>('/trainings', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTrainingDto): Promise<Training> => {
    const response = await apiClient.patch<Training>(`/trainings/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/trainings/${id}`);
  },
};