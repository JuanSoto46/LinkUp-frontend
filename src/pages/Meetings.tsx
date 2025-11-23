import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Meeting = {
  id: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  createdAt?: string;
};

export default function Meetings() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMeetings() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMeetings();
      const list = res.meetings || res.data || [];
      setMeetings(list);
    } catch (e: any) {
      setError(e.message || "No se pudieron cargar tus reuniones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeetings();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-50">
          Mis reuniones
        </h1>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-full border border-slate-600 text-sm text-slate-200 hover:bg-slate-800"
            onClick={() => navigate("/call")}
          >
            Unirse
          </button>

          <button
            className="px-4 py-2 rounded-full bg-sky-600 text-sm text-slate-50 hover:bg-sky-500 shadow"
            onClick={() => navigate("/create-meeting")}
          >
            Crear
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-[#050816] p-6 text-sm text-slate-300 animate-pulse">
          Cargando reuniones...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
          <div className="mt-3">
            <button
              onClick={loadMeetings}
              className="text-xs px-3 py-1.5 rounded-full border border-red-400/60 hover:bg-red-500/10"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && meetings.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-[#050816] p-6 text-sm text-slate-300">
          Aún no tienes reuniones. Crea la primera con el botón de arriba.
        </div>
      )}

      {!loading && !error && meetings.length > 0 && (
        <div className="grid gap-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-slate-800 bg-[#050816] p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {m.title}
                </p>
                {m.description && (
                  <p className="text-xs text-slate-400 mt-1">
                    {m.description}
                  </p>
                )}
              </div>

              <button
                className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800"
                onClick={() => navigate(`/call?meetingId=${m.id}`)}
              >
                Entrar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
