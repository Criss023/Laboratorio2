// src/schemas/trainingSchema.ts
import { z } from 'zod';

export const trainingSchema = z.object({
  name: z
    .string({ error: 'El nombre es requerido' })
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  instructor: z
    .string({ error: 'El instructor es requerido' })
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  startDate: z
    .string({ error: 'La fecha de inicio es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),

  endDate: z
    .string({ error: 'La fecha de fin es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),

  status: z
    .enum(['scheduled', 'in_progress', 'completed', 'cancelled'])
    .default('scheduled'),

  employeeIds: z
    .array(z.number())
    .default([]),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: 'La fecha de fin debe ser igual o posterior a la de inicio', path: ['endDate'] }
);

export type TrainingFormData = z.infer<typeof trainingSchema>;
export type TrainingFormInput = z.input<typeof trainingSchema>;