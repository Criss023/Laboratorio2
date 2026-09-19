// src/components/TrainingCard.tsx
import type { Training, Employee } from '../types';

interface TrainingCardProps {
  training: Training;
  employees: Employee[];
  onEdit?:   (training: Training) => void;
  onDelete?: (id: number) => void;
}

const statusConfig: Record<Training['status'], { bg: string; text: string; label: string }> = {
  scheduled:   { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Programada'   },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En curso'      },
  completed:   { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Completada'   },
  cancelled:   { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Cancelada'    },
};

function TrainingCard({ training, employees, onEdit, onDelete }: TrainingCardProps) {
  const { name, instructor, startDate, endDate, status, employeeIds } = training;
  const statusStyle = statusConfig[status];

  const enrolledNames = employees
    .filter(e => employeeIds.includes(e.id))
    .map(e => e.name);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 w-full hover:shadow-md hover:border-blue-300 transition-all duration-200">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-900 leading-snug">{name}</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Instructor */}
      <p className="text-sm text-slate-500 mb-2">
        <span className="font-medium text-slate-700">Instructor:</span> {instructor}
      </p>

      {/* Fechas */}
      <p className="text-xs text-slate-400 mb-3">
        {startDate} → {endDate}
      </p>

      {/* Empleados inscritos */}
      <div className="text-xs text-slate-500 mb-4">
        <span className="font-medium text-slate-700">Inscritos ({enrolledNames.length}):</span>{' '}
        {enrolledNames.length > 0
          ? enrolledNames.slice(0, 3).join(', ') + (enrolledNames.length > 3 ? ` +${enrolledNames.length - 3}` : '')
          : 'Ninguno'}
      </div>

      {/* Acciones */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          {onEdit && (
            <button
              onClick={() => onEdit(training)}
              className="flex-1 text-xs py-1.5 rounded-md border border-brand-600 text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(training.id)}
              className="flex-1 text-xs py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TrainingCard;