import { useNavigate } from "react-router-dom";
import { useCallUi } from "../context/CallUiContext";
import { auth } from "../lib/firebase";

export function MiniCall() {
  const { activeCall, isMinimized, setMinimized } = useCallUi();
  const navigate = useNavigate();
  const user = auth.currentUser;

  if (!activeCall || !isMinimized) return null;

  const handleReturnToCall = () => {
    setMinimized(false);
    navigate(`/call?meetingId=${activeCall.meetingId}`);
  };

  const getUserInitials = () => {
    const displayName =
      user?.displayName || user?.email || activeCall.title || "User";
    return (
      displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "US"
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md w-72">
        {/* Zona clicable: vista previa */}
        <button
          type="button"
          onClick={handleReturnToCall}
          className="w-full text-left"
        >
          {/* Mini “video” */}
          <div className="relative h-32 bg-slate-900">
            {/* Glow de fondo */}
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_15%_15%,rgba(52,211,153,0.4)_0,transparent_55%),radial-gradient(circle_at_85%_0,rgba(56,189,248,0.35)_0,transparent_55%)]" />

            {/* Contenido principal */}
            <div className="relative h-full flex items-center justify-center">
              {/* Avatar central */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/40">
                  {getUserInitials()}
                </div>
                {/* Indicador de estado */}
                <span className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow shadow-emerald-400/60" />
              </div>
            </div>

            {/* Barra inferior sobrepuesta (info rápida) */}
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 border-t border-slate-800/80 px-3 py-1.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Llamada en curso
                </span>
                <span className="text-[11px] font-medium text-slate-50 truncate max-w-[160px]">
                  {activeCall.title || "Reunión sin título"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Volver</span>
                <svg
                  className="w-3.5 h-3.5 text-slate-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l-7 7m0 0l7 7M2 12h20"
                  />
                </svg>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
