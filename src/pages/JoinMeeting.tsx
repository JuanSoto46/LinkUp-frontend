import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Join meeting page for entering meeting ID to join unplanned meetings
 */
export default function JoinMeeting() {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle joining a meeting by ID
   */
  async function handleJoinMeeting(e: React.FormEvent) {
    e.preventDefault();
    
    if (!meetingId.trim()) {
      setError("Por favor ingresa un ID de reunión válido");
      return;
    }

    setLoading(true);
    setError(null);

    // Validar formato básico del ID (puedes ajustar según tu formato)
    if (meetingId.length < 6) {
      setError("El ID de reunión parece ser demasiado corto");
      setLoading(false);
      return;
    }

    // Simular validación o puedes agregar una verificación real con la API
    try {
      // Aquí podrías validar con la API si la reunión existe
      // const meetingExists = await api.validateMeeting(meetingId);
      
      // Por ahora, redirigimos directamente
      navigate(`/call?meetingId=${meetingId.trim()}`);
    } catch (err: any) {
      setError("Error al validar la reunión: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-green-400 font-medium">UNIRSE A REUNIÓN</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Unirse a Reunión
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ingresa el ID de la reunión para participar
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleJoinMeeting} className="space-y-6">
        <div>
          <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ID de la Reunión *
          </label>
          <input
            id="meetingId"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-center"
            placeholder="Ej: abc123-def456"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            required
            disabled={loading}
            autoFocus
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            El organizador de la reunión debe proporcionarte este ID
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !meetingId.trim()}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uniéndose...</span>
              </>
            ) : (
              <>
                <span>Unirse a Reunión</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-300 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ¿Dónde encuentro el ID?
        </h3>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Pídele al organizador de la reunión</li>
          <li>• Revisa el correo de invitación</li>
          <li>• En la lista de reuniones, aparece como "ID de reunión"</li>
        </ul>
      </div>
    </div>
  );
}