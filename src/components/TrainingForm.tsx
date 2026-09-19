// src/components/TrainingForm.tsx
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trainingSchema, type TrainingFormData, type TrainingFormInput } from '../schemas/trainingSchema';
import type { Training, Employee } from '../types';

interface TrainingFormProps {
  training?:  Training;
  employees:  Employee[];
  onSubmit:   (data: TrainingFormData) => Promise<void>;
  onCancel:   () => void;
  isLoading?: boolean;
  error?:     string | null;
}

function FormField({
  label, error, children, required = false,
}: {
  label: string; error?: string; children: ReactNode; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

const inputClass = (hasError: boolean) => `
  w-full px-3 py-2 border rounded-lg text-sm transition-colors
  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
  ${hasError ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-slate-300 bg-white'}
`;

function TrainingForm({ training, employees, onSubmit, onCancel, isLoading = false, error }: TrainingFormProps) {
  const isEditing = !!training;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TrainingFormInput, unknown, TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      name:        '',
      instructor:  '',
      startDate:   new Date().toISOString().split('T')[0],
      endDate:     new Date().toISOString().split('T')[0],
      status:      'scheduled',
      employeeIds: [],
    },
  });

  useEffect(() => {
    if (training) {
      reset({
        name:        training.name,
        instructor:  training.instructor,
        startDate:   training.startDate,
        endDate:     training.endDate,
        status:      training.status,
        employeeIds: training.employeeIds,
      });
    }
  }, [training, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Nombre */}
      <FormField label="Nombre de la capacitación" error={errors.name?.message} required>
        <input
          {...register('name')}
          type="text"
          placeholder="React Avanzado"
          className={inputClass(!!errors.name)}
          aria-required="true"
        />
      </FormField>

      {/* Instructor */}
      <FormField label="Instructor" error={errors.instructor?.message} required>
        <input
          {...register('instructor')}
          type="text"
          placeholder="Juan Pérez"
          className={inputClass(!!errors.instructor)}
          aria-required="true"
        />
      </FormField>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Fecha de inicio" error={errors.startDate?.message} required>
          <input
            {...register('startDate')}
            type="date"
            className={inputClass(!!errors.startDate)}
            aria-required="true"
          />
        </FormField>

        <FormField label="Fecha de fin" error={errors.endDate?.message} required>
          <input
            {...register('endDate')}
            type="date"
            className={inputClass(!!errors.endDate)}
            aria-required="true"
          />
        </FormField>
      </div>

      {/* Estado */}
      <FormField label="Estado" error={errors.status?.message}>
        <select {...register('status')} className={inputClass(!!errors.status)}>
          <option value="scheduled">Programada</option>
          <option value="in_progress">En curso</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </FormField>

      {/* Empleados inscritos (multi-select) */}
      <FormField label="Empleados inscritos" error={errors.employeeIds?.message}>
        <select
          multiple
          {...register('employeeIds', { setValueAs: (v) => Array.from(v as HTMLCollectionOf<HTMLOptionElement>, (o) => Number(o.value)) })}
          className={`${inputClass(!!errors.employeeIds)} min-h-[120px]`}
        >
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} — {emp.department}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Mantén Ctrl/Cmd para seleccionar varios</p>
      </FormField>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || (!isDirty && isEditing)}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50 min-w-24"
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear capacitación'}
        </button>
      </div>
    </form>
  );
}

export default TrainingForm;