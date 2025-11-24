import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

/**
 * Meeting entity as returned by the backend API.
 */
type Meeting = {
  id: string;
  title: string;
  description?: string;
  scheduledAt?: string | null;
  createdAt?: string;
};

/**
 * Formats an ISO date/time string into a human readable
 * Spanish representation used in the meetings list.
 *
 * @param value - ISO date string or null/undefined.
 * @returns Formatted string ready to render.
 */
function formatDateTime(value?: string | null): string {
  if (!value) return "Sin fecha programada";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || "";
  return d.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Meetings page that allows the user to:
 * - list their meetings
 * - edit title / description / scheduled date-time
 * - delete a meeting
 * - navigate to join or create a meeting
 *
 * It relies on the backend API exposed in ../lib/api.
 */
export default function Meetings() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Fetches the meetings from the backend and updates local state.
   * Handles loading and error states.
   */
  async function loadMeetings() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMeetings();
      // Backend most likely returns a plain array,
      // but we try a few common shapes to be safe.
      const list: Meeting[] = Array.isArray(res)
        ? res
        : (res as any).meetings || (res as any).data || [];
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

  /**
   * Starts editing mode for a given meeting and
   * pre-fills the local form state.
   *
   * @param meeting - Meeting to be edited.
   */
  function startEdit(meeting: Meeting) {
    setEditingId(meeting.id);
    setEditTitle(meeting.title || "");
    setEditDescription(meeting.description || "");

    if (meeting.scheduledAt) {
      const d = new Date(meeting.scheduledAt);
      if (!Number.isNaN(d.getTime())) {
        // Convert ISO to a value compatible with datetime-local
        const pad = (n: number) => String(n).padStart(2, "0");
        const local = new Date(
          d.getTime() - d.getTimezoneOffset() * 60000
        );
        const y = local.getFullYear();
        const m = pad(local.getMonth() + 1);
        const day = pad(local.getDate());
        const hh = pad(local.getHours());
        const mm = pad(local.getMinutes());
        setEditScheduledAt(`${y}-${m}-${day}T${hh}:${mm}`);
      } else {
        setEditScheduledAt("");
      }
    } else {
      setEditScheduledAt("");
    }
  }

  /**
   * Resets the editing state and clears the temporary form values.
   */
  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditScheduledAt("");
  }

  /**
   * Persists the edited meeting data to the backend and
   * updates the local list with the returned entity.
   *
   * @param id - ID of the meeting being saved.
   */
  async function handleSave(id: string) {
    try {
      setSavingId(id);
      setError(null);

      const payload: {
        title?: string;
        description?: string;
        scheduledAt?: string | null;
      } = {
        title: editTitle,
        description: editDescription,
      };

      if (editScheduledAt) {
        const local = new Date(editScheduledAt);
        payload.scheduledAt = local.toISOString();
      } else {
        payload.scheduledAt = null;
      }

      const updated = (await api.updateMeeting(id, payload)) as Meeting;

      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
      cancelEdit();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "No se pudo guardar la reunión.");
    } finally {
      setSavingId(null);
    }
  }

  /**
   * Asks for confirmation and, if accepted, deletes a meeting
   * using the backend API, then removes it from local state.
   *
   * @param id - ID of the meeting to delete.
   */
  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar/cancelar esta reunión?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError(null);
      await api.deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      console.error(e);
      setError(e.message || "No se pudo eliminar la reunión.");
    } finally {
      setDeletingId(null);
    }
  }

  /**
   * Navigate to join meeting page for entering meeting ID
   */
  function handleJoinMeeting() {
    navigate("/join-meeting");
  }

  /**
   * Enter directly into an existing meeting
   */
  function handleEnterMeeting(meetingId: string) {
    navigate(`/call?meetingId=${meetingId}`);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-50">
          Mis reuniones
        </h1>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-full border border-slate-600 text-sm text-slate-200 hover:bg-slate-800"
            onClick={handleJoinMeeting}
          >
            Unirse a reunión
          </button>

          <button
            className="px-4 py-2 rounded-full bg-sky-600 text-sm text-slate-50 hover:bg-sky-500 shadow"
            onClick={() => navigate("/create-meeting")}
          >
            Crear reunión
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
          {meetings.map((m) => {
            const isEditing = editingId === m.id;

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-800 bg-[#050816] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                {isEditing ? (
                  <div className="flex-1 grid gap-3 text-sm">
                    <p className="text-[11px] text-slate-400 mb-1 break-all">
                      <span className="font-semibold">
                        ID de reunión:
                      </span>{" "}
                      <span className="font-mono">
                        {m.id}
                      </span>
                    </p>

                    <label className="grid gap-1">
                      <span>Título de la reunión</span>
                      <input
                        className="h-10 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
                        value={editTitle}
                        onChange={(e) =>
                          setEditTitle(e.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="grid gap-1">
                      <span>Fecha y hora programada</span>
                      <input
                        type="datetime-local"
                        className="h-10 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
                        value={editScheduledAt}
                        onChange={(e) =>
                          setEditScheduledAt(e.target.value)
                        }
                      />
                    </label>

                    <label className="grid gap-1">
                      <span>Descripción</span>
                      <textarea
                        className="min-h-[70px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-100">
                      {m.title || "Reunión sin título"}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Creada: {formatDateTime(m.createdAt)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Programada: {formatDateTime(m.scheduledAt)}
                    </p>

                    <p className="text-[11px] text-slate-500 mt-1 break-all">
                      <span className="font-semibold">
                        ID de reunión:
                      </span>{" "}
                      <span className="font-mono">
                        {m.id}
                      </span>
                    </p>

                    {m.description && (
                      <p className="text-xs text-slate-300 mt-2">
                        {m.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-end">
                  {isEditing ? (
                    <>
                      <button
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800"
                        type="button"
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 rounded-full bg-sky-600 text-slate-50 hover:bg-sky-500 disabled:opacity-60"
                        type="button"
                        disabled={savingId === m.id}
                        onClick={() => handleSave(m.id)}
                      >
                        {savingId === m.id
                          ? "Guardando..."
                          : "Guardar cambios"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800"
                        type="button"
                        onClick={() => handleEnterMeeting(m.id)}
                      >
                        Entrar
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800"
                        type="button"
                        onClick={() => startEdit(m)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 rounded-full border border-red-500/70 text-red-200 hover:bg-red-500/10 disabled:opacity-60"
                        type="button"
                        disabled={deletingId === m.id}
                        onClick={() => handleDelete(m.id)}
                      >
                        {deletingId === m.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}