import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  ownerUid: string;
  createdAt: string;
  status: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
}

/**
 * Call / meeting view with Google Meet style interface
 */
export default function Call() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const meetingId = searchParams.get("meetingId");

  // Mock data para participantes y chat (en sprints futuros vendrá de WebRTC)
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "Juan Pérez", email: "juan@ejemplo.com", isOnline: true },
    { id: "2", name: "María García", email: "maria@ejemplo.com", isOnline: true },
    { id: "3", name: "Carlos López", email: "carlos@ejemplo.com", isOnline: true },
    { id: "4", name: "Ana Martínez", email: "ana@ejemplo.com", isOnline: false }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Juan Pérez", message: "¿Todos listos para comenzar?", time: "10:00" },
    { id: 2, user: "María García", message: "Sí, estoy aquí", time: "10:01" },
    { id: 3, user: "Carlos López", message: "Listo por acá", time: "10:02" },
    { id: 4, user: "Ana Martínez", message: "Me conecto en 5 min", time: "10:03" }
  ]);

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (meetingId) {
      loadMeetingData();
    } else {
      setError("No se proporcionó ID de reunión");
      setLoading(false);
    }
  }, [meetingId]);

  const loadMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener datos reales de la reunión
      const response = await api.getMeeting(meetingId!);
      
      if (response.success) {
        setMeeting(response.meeting);
      } else {
        setError("No se pudo cargar la información de la reunión");
      }
    } catch (err: any) {
      console.error("Error loading meeting:", err);
      setError("Error al cargar la reunión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return "US";
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || "US";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newChatMessage = {
      id: chatMessages.length + 1,
      user: user?.displayName || user?.email || "Tú",
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newChatMessage]);
    setNewMessage("");
  };

  const handleEndCall = () => {
    if (window.confirm("¿Estás seguro de que quieres finalizar la llamada?")) {
      navigate("/meetings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando reunión...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Error</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => navigate("/meetings")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver a Reuniones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header de la llamada */}
      <div className="border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 grid place-items-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">En reunión</span>
              </div>
              
              <div className="hidden md:block border-l border-slate-600 h-6"></div>
              
              <div className="hidden md:block">
                <h1 className="text-sm font-semibold">
                  {meeting?.title || "Reunión sin título"}
                </h1>
                <p className="text-xs text-slate-300">ID: {meetingId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 hidden sm:block">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={() => navigate("/meetings")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Volver</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Layout responsivo */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Columna izquierda - Video y controles (2/3 en desktop) */}
          <div className="lg:flex-1 lg:max-w-[66.666%]">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 md:p-6">
              {/* Información de la reunión (solo móvil) */}
              <div className="md:hidden mb-4 p-3 bg-slate-800 rounded-lg">
                <h1 className="font-semibold text-slate-100">
                  {meeting?.title || "Reunión sin título"}
                </h1>
                <p className="text-xs text-slate-300 mt-1">ID: {meetingId}</p>
                {meeting?.description && (
                  <p className="text-sm text-slate-400 mt-2">{meeting.description}</p>
                )}
              </div>

              {/* Video principal */}
              <div className="aspect-video bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500 grid place-items-center text-xl md:text-2xl font-semibold text-slate-900 mx-auto mb-4">
                    {getUserInitials()}
                  </div>
                  <p className="text-slate-300 text-sm">Tu video aparecerá aquí</p>
                </div>
              </div>

              {/* Grid de participantes responsivo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {participants.filter(p => p.isOnline).map((participant) => (
                  <div key={participant.id} className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 grid place-items-center text-white font-semibold text-xs md:text-sm mx-auto mb-2">
                      {participant.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <p className="text-xs text-slate-300 truncate">{participant.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] text-green-400">En línea</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles tipo Google Meet */}
              <div className="flex justify-center items-center gap-3 md:gap-4">
                {/* Micrófono */}
                <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Cámara */}
                <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Pantalla */}
                <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Finalizar llamada */}
                <button 
                  onClick={handleEndCall}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 hover:bg-red-500 grid place-items-center transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha - Chat y participantes (1/3 en desktop) */}
          <div className="lg:w-80 flex flex-col gap-6">
            {/* Lista de participantes - ARRIBA en móvil, mantiene posición en desktop */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 order-1 lg:order-1">
              <h3 className="font-semibold text-slate-200 mb-3 flex items-center justify-between">
                <span>Participantes ({participants.filter(p => p.isOnline).length})</span>
                <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                  {participants.filter(p => p.isOnline).length} en línea
                </span>
              </h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      participant.isOnline ? 'bg-slate-800/50' : 'bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold text-white ${
                        participant.isOnline ? 'bg-blue-500' : 'bg-slate-600'
                      }`}>
                        {participant.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">{participant.name}</p>
                        <p className="text-xs text-slate-400 truncate">{participant.email}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      participant.isOnline ? 'bg-green-500' : 'bg-slate-500'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat - ABAJO en móvil, mantiene posición en desktop */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 order-2 lg:order-2">
              <h3 className="font-semibold text-slate-200 mb-3">Chat en vivo</h3>
              
              {/* Mensajes del chat */}
              <div className="h-48 md:h-56 overflow-y-auto space-y-3 mb-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-medium ${
                        msg.user === (user?.displayName || user?.email || "Tú") 
                          ? "text-blue-400" 
                          : "text-slate-200"
                      }`}>
                        {msg.user}
                      </span>
                      <span className="text-xs text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-slate-300 text-xs bg-slate-800/50 rounded-lg p-2">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Input del chat */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg px-3 py-2 text-white text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}