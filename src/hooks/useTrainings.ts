// src/hooks/useTrainings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingService, type TrainingFilters } from '../services/trainingService';
import type { CreateTrainingDto, UpdateTrainingDto } from '../types';

export const trainingKeys = {
  all:    ['trainings'] as const,
  list:   (filters: TrainingFilters) => ['trainings', 'list', filters] as const,
  detail: (id: number) => ['trainings', id] as const,
};

export function useTrainings(filters: TrainingFilters = {}) {
  return useQuery({
    queryKey: trainingKeys.list(filters),
    queryFn:  () => trainingService.getAll(filters),
  });
}

export function useTraining(id: number | null) {
  return useQuery({
    queryKey: trainingKeys.detail(id!),
    queryFn:  () => trainingService.getById(id!),
    enabled:  !!id,
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTrainingDto) => trainingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTrainingDto }) =>
      trainingService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(trainingKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => trainingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}