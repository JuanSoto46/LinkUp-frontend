import { FormEvent, useState } from "react";
import { api } from "../lib/api";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

/**
 * Create meeting page with form validation and success feedback
 * Implements usability heuristic: User control and freedom
 */
export default function CreateMeeting() {
  const [form, setForm] = useState({
    title: "",
    scheduledAt: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  /**
   * Handle meeting creation form submission
   */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError("Debes iniciar sesión para crear una reunión");
      setLoading(false);
      return;
    }

    try {
      const response = await api.createMeeting(form);
      
      if (response.success) {
        setSuccess(true);
        setMeetingId(response.meeting?.id);
        
        // Reset form
        setForm({
          title: "",
          scheduledAt: "",
          description: ""
        });

        // Auto-redirect after success
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(response.error || "Error al crear la reunión");
      }
    } catch (err: any) {
      console.error("Meeting creation error:", err);
      setError(err.message || "Error al crear la reunión. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Acceso Requerido
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Debes iniciar sesión para crear una reunión
        </p>
        <button
          onClick={() => navigate("/auth/login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-blue-400 font-medium">NUEVA REUNIÓN</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Crear Nueva Reunión
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Programa una reunión y conecta con tu equipo
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl" role="alert">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">¡Reunión creada exitosamente!</p>
              {meetingId && (
                <p className="text-sm mt-1">
                  ID de la reunión: <span className="font-mono bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{meetingId}</span>
                </p>
              )}
              <p className="text-sm mt-1">Serás redirigido al inicio en unos segundos...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl" role="alert">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título de la Reunión *
          </label>
          <input
            id="title"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Ej: Reunión de equipo - Planificación Q1"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha y Hora Programada
          </label>
          <input
            id="scheduledAt"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={e => setForm({...form, scheduledAt: e.target.value})}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Si no seleccionas una fecha, la reunión se creará como inmediata
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            id="description"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe el propósito de la reunión, agenda, o cualquier información relevante..."
            rows={4}
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando Reunión...</span>
              </>
            ) : (
              <>
                <span>Crear Reunión</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}