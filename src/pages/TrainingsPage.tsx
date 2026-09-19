// src/pages/TrainingsPage.tsx
import { useState, useCallback } from 'react';
import type { Training, TrainingStatus } from '../types';
import TrainingCard from '../components/TrainingCard';
import StatsBadge from '../components/StatsBadge';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import TrainingForm from '../components/TrainingForm';
import { useTrainings, useCreateTraining, useUpdateTraining, useDeleteTraining } from '../hooks/useTrainings';
import { useEmployees } from '../hooks/useEmployees';
import type { TrainingFormData } from '../schemas/trainingSchema';

const formFieldClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const statusLabels: Record<TrainingStatus, string> = {
  scheduled:   'Programada',
  in_progress: 'En curso',
  completed:   'Completada',
  cancelled:   'Cancelada',
};

function TrainingsPage() {
  const [search, setSearch]           = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TrainingStatus | ''>('');

  // Datos del servidor
  const { data, isLoading, isError, error: queryError } = useTrainings({
    search: search || undefined,
    status: selectedStatus || undefined,
  });
  const trainings = data?.data || [];

  // Todos sin filtro — para las estadísticas
  const { data: allData } = useTrainings({});
  const allTrainings = allData?.data ?? [];

  // Empleados — para el formulario y las tarjetas
  const { data: empData } = useEmployees({});
  const employees = empData?.data ?? [];

  // Estadísticas
  const totalTrainings     = allTrainings.length;
  const scheduledCount     = allTrainings.filter(t => t.status === 'scheduled').length;
  const inProgressCount    = allTrainings.filter(t => t.status === 'in_progress').length;
  const completedCount     = allTrainings.filter(t => t.status === 'completed').length;

  // Mutaciones
  const createTraining = useCreateTraining();
  const updateTraining = useUpdateTraining();
  const deleteTraining = useDeleteTraining();

  // Estado del modal
  const [modalOpen, setModalOpen]           = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | undefined>();
  const [submitError, setSubmitError]       = useState<string | null>(null);

  const handleOpenCreate = useCallback(() => {
    setEditingTraining(undefined);
    setSubmitError(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((training: Training) => {
    setEditingTraining(training);
    setSubmitError(null);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta capacitación?')) return;
    deleteTraining.mutate(id);
  }, [deleteTraining]);

  const handleSubmit = useCallback(async (formData: TrainingFormData) => {
    setSubmitError(null);
    try {
      if (editingTraining) {
        await updateTraining.mutateAsync({ id: editingTraining.id, data: formData });
      } else {
        await createTraining.mutateAsync(formData);
      }
      setModalOpen(false);
    } catch {
      setSubmitError('No se pudo guardar la capacitación. Intenta de nuevo.');
    }
  }, [editingTraining, createTraining, updateTraining]);

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Capacitaciones</h2>
          <p className="text-slate-500 mt-1">
            {isLoading ? 'Cargando...' : `${trainings.length} de ${totalTrainings} capacitaciones`}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva capacitación
        </button>
      </div>

      {/* Estadísticas */}
      <div className="flex flex-wrap gap-4 mb-6">
        <StatsBadge label="Total"       value={totalTrainings}  variant="blue"   />
        <StatsBadge label="Programadas" value={scheduledCount}  variant="blue"   />
        <StatsBadge label="En curso"    value={inProgressCount} variant="yellow" />
        <StatsBadge label="Completadas" value={completedCount}  variant="green"  />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-end gap-3">
        <FormField label="Buscar" className="flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Buscar por nombre o instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={formFieldClass}
          />
        </FormField>

        <FormField label="Estado" className="min-w-[180px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TrainingStatus | '')}
            className={formFieldClass}
          >
            <option value="">Todos los estados</option>
            {(Object.keys(statusLabels) as TrainingStatus[]).map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </FormField>

        {(search || selectedStatus) && (
          <button
            onClick={() => { setSearch(''); setSelectedStatus(''); }}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Estado: cargando */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mr-3" />
          <span>Cargando capacitaciones...</span>
        </div>
      )}

      {/* Estado: error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Error al cargar las capacitaciones</p>
          <p className="text-red-500 text-sm mt-1">{(queryError as Error)?.message || 'Error desconocido'}</p>
        </div>
      )}

      {/* Sin resultados */}
      {!isLoading && !isError && trainings.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No se encontraron capacitaciones con los filtros aplicados.</p>
        </div>
      )}

      {/* Grid de tarjetas */}
      {!isLoading && !isError && trainings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {trainings.map(training => (
            <TrainingCard
              key={training.id}
              training={training}
              employees={employees}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        title={editingTraining ? `Editar: ${editingTraining.name}` : 'Nueva capacitación'}
        onClose={() => setModalOpen(false)}
      >
        <TrainingForm
          training={editingTraining}
          employees={employees}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={createTraining.isPending || updateTraining.isPending}
          error={submitError}
        />
      </Modal>
    </div>
  );
}

export default TrainingsPage;