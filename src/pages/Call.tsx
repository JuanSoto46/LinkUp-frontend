import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { socketService } from "../lib/socket";
import { useCallUi } from "../context/CallUiContext";


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
  userId: string;
  socketId: string;
  displayName: string;
  email: string;
  joinedAt: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  message: string;
  type: "text" | "system";
  timestamp: string;
}

/**
 * Call page component.
 * Layout de llamada + participantes + chat.
 * Solo se toca la vista, no la lógica de negocio.
 */
export default function Call() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const meetingId = searchParams.get("meetingId");
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Vista móvil: "call" | "participants" | "chat"
  const [mobileView, setMobileView] = useState<"call" | "participants" | "chat">(
    "call"
  );

  // Panel lateral de escritorio
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const bothPanelsOpen = showParticipantsPanel && showChatPanel;

  // Info de la llamada / enlace compartible
  const [showCallInfo, setShowCallInfo] = useState(false);
  const [shareLink, setShareLink] = useState("");
  
  const { setActiveCall, setMinimized } = useCallUi();

  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);


  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
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

  useEffect(() => {
    if (meeting && user && meetingId) {
      initializeSocket();
    }

    return () => {
      socketService.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting, user, meetingId]);

  const initializeSocket = async () => {
    try {
      console.log("🔄 Initializing socket...");
      setSocketError(null);

      await socketService.connect();
      socketService.removeAllListeners();

      socketService.onMessage((message: ChatMessage) => {
        console.log("📨 New message received:", message);
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      });

      socketService.onUserEvent((event) => {
        console.log("👤 User event:", event);

        if (event.type === "user_joined" || event.type === "user_left") {
          if (event.participants) {
            const uniqueParticipants = Array.from(
              new Map(event.participants.map((p: any) => [p.userId, p])).values()
            );
            setParticipants(uniqueParticipants);
          }

          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}-${Math.random()}`,
            userId: "system",
            displayName: "Sistema",
            message:
              event.type === "user_joined"
                ? `${event.displayName} se unió a la reunión`
                : `${event.displayName} salió de la reunión`,
            type: "system",
            timestamp: event.timestamp || new Date().toISOString(),
          };
          setChatMessages((prev) => [...prev, systemMessage]);
        }
      });

      socketService.getSocket()?.on(
        "user_typing",
        (data: { userId: string; displayName: string }) => {
          console.log("⌨️ User typing:", data);
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.displayName) newSet.add(data.displayName);
            return newSet;
          });
        }
      );

      socketService.getSocket()?.on(
        "user_stop_typing",
        (data: { userId: string }) => {
          console.log("⌨️ User stopped typing:", data);
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            const userToRemove = participants.find(
              (p) => p.userId === data.userId
            );
            if (userToRemove) newSet.delete(userToRemove.displayName);
            return newSet;
          });
        }
      );

      socketService.onError((error) => {
        console.error("❌ Socket error:", error);
        setSocketError(error.message || "Error de conexión con el chat");
      });

      socketService.onMeetingJoined((data) => {
  console.log("✅ Joined meeting:", data);
  setIsConnected(true);
  setSocketError(null);

  if (data.participants) {
    const uniqueParticipants = Array.from(
      new Map(data.participants.map((p: any) => [p.userId, p])).values()
    );
    setParticipants(uniqueParticipants);
  }

        const welcomeMessage: ChatMessage = {
    id: `system-${Date.now()}-${Math.random()}`,
    userId: "system",
    displayName: "Sistema",
    message: `Te has unido a "${data.meetingTitle}"`,
    type: "system",
    timestamp: new Date().toISOString(),
  };
  setChatMessages([welcomeMessage]);

  setActiveCall({
    meetingId: meetingId!,
    title: data.meetingTitle || meeting?.title || "Reunión sin título",
  });
  setMinimized(false);
});

      console.log(" Joining meeting:", meetingId);
      await socketService.joinMeeting(meetingId!);
    } catch (error: any) {
      console.error(" Error initializing socket:", error);
      setSocketError(
        error.message || "No se pudo conectar al chat en tiempo real"
      );
      setIsConnected(false);
    }
  };

  const loadMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📋 Loading meeting data:", meetingId);

      const response = await api.getMeeting(meetingId!);

      if (response.success) {
        console.log("✅ Meeting loaded:", response.meeting);
        setMeeting(response.meeting);
      } else {
        const errorMsg = "No se pudo cargar la información de la reunión";
        console.error("❌", errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("❌ Error loading meeting:", err);
      const errorMsg =
        "Error al cargar la reunión: " + (err.message || "Error desconocido");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name && !user) return "US";
    const displayName = name || user?.displayName || user?.email || "";

    return (
      displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "US"
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (socketService.isConnected()) {
        await socketService.sendMessage(newMessage);
        setNewMessage("");
      } else {
        throw new Error("No conectado al servidor");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setSocketError("Error al enviar mensaje");
    }
  };

  const handleTyping = () => {
    if (!socketService.isConnected() || !newMessage.trim()) return;

    socketService.startTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socketService.isConnected()) {
      socketService.stopTyping();
    }
  };

  const handleEndCall = () => {
      socketService.disconnect();
      setActiveCall(null);      
      setMinimized(false); 
      navigate("/meetings");
  };

  const handleRetryConnection = () => {
    setSocketError(null);
    if (meetingId) initializeSocket();
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (iso?: string) => {
  if (!iso) return "N/D";
  return new Date(iso).toLocaleString();
};

const getDisplayMeetingCode = () => {
  if (!meetingId) return "N/D";
  const clean = meetingId.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length <= 8) return clean.toUpperCase();
  const short = clean.slice(-8).toUpperCase(); // últimos 8
  return short.replace(/(.{4})/g, "$1-").replace(/-$/, "");
};

const handleCopyMeetingCode = async () => {
  if (!meetingId) return;
  try {
    await navigator.clipboard.writeText(meetingId);
    alert("Código de reunión copiado al portapapeles");
  } catch (err) {
    console.error("Error al copiar código", err);
    alert("No se pudo copiar el código. Copia el texto manualmente.");
  }
};


  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("Enlace copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar enlace", err);
      alert("No se pudo copiar el enlace. Copia el texto manualmente.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando reunión...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">
            Error
          </h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/meetings")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Volver a Reuniones
            </button>
            <button
              onClick={loadMeetingData}
              className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900 py-2 px-3 lg:px-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full grid place-items-center shadow-inner ${
                  isConnected
                    ? "bg-emerald-500"
                    : socketError
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium">
                  {isConnected
                    ? "En reunión"
                    : socketError
                    ? "Error de conexión"
                    : "Conectando..."}
                </span>
                {socketError && (
                  <button
                    onClick={handleRetryConnection}
                    className="text-[11px] text-blue-400 hover:text-blue-300 ml-2 underline"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            </div>

            <div className="hidden sm:block border-l border-slate-600 h-5" />

            <div className="hidden sm:block min-w-0">
              <h1 className="text-sm font-semibold truncate max-w-[260px]">
                {meeting?.title || "Reunión sin título"}
              </h1>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{participants.length} participantes</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón móvil Participantes */}
            <button
              type="button"
              onClick={() => setMobileView("participants")}
              className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors text-xs"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 11a4 4 0 100-8 4 4 0 000 8zm0 0c-4.418 0-8 2.239-8 5v2h8m6-9a3 3 0 110-6 3 3 0 010 6z"
                />
              </svg>
              <span>Participantes</span>
            </button>

            {/* Botón móvil Chat */}
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors text-xs"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h8M8 14h5M4 6h16v10H5.5L4 17.5V6z"
                />
              </svg>
              <span>Chat</span>
            </button>

            <button
  onClick={() => {
    setMinimized(true);      
    navigate("/meetings");   
  }}
  className="flex items-center gap-2 px-3 py-1 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors text-xs sm:text-sm"
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
  <span className="hidden sm:inline">Salir</span>
</button>

          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden">
        {/* Zona de video */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-3 lg:p-4 flex-1 flex flex-col min-h-0 overflow-hidden shadow-[0_0_0_1px_rgba(15,23,42,0.6)]">
            {/* Video principal */}
            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/80 flex items-center justify-center mb-3 lg:mb-4 min-h-0 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.15)_0,transparent_55%),radial-gradient(circle_at_80%_0,rgba(129,140,248,0.18)_0,transparent_55%)]" />
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-xl font-semibold text-slate-950 mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                  {getUserInitials()}
                </div>
                <p className="text-slate-200 text-sm">
                </p>
                <p
                  className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                    isConnected ? "text-emerald-400" : "text-yellow-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-current" />
                  <span>
                    {isConnected ? "Conectado" : "Conectando..."}
                  </span>
                </p>
              </div>
            </div>

            {/* Botones panel lateral escritorio */}
            <div className="hidden lg:flex justify-end gap-2 mb-3">
              <button
                type="button"
                onClick={() =>
                  setShowParticipantsPanel((prev) => !prev)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  showParticipantsPanel
                    ? "bg-slate-100 text-slate-900 border-slate-100"
                    : "bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Participantes</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowChatPanel((prev) => !prev)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  showChatPanel
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Chat</span>
              </button>
            </div>

            {/* Recuadros de participantes abajo */}
            <div className="mb-3 lg:mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">
                  Participantes ({participants.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                {participants.map((participant) => (
                  <div
                    key={participant.socketId}
                    className="rounded-xl bg-slate-800/80 border border-slate-700/90 p-2 flex flex-col items-center justify-center shadow-sm h-24"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-xs font-semibold text-white shadow-md shadow-blue-500/30">
                      {getUserInitials(participant.displayName)}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-slate-100 truncate w-full text-center">
                      {participant.displayName}
                    </p>
                    <p className="mt-0.5 text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-[2px] bg-emerald-400" />
                      <span>En línea</span>
                    </p>
                  </div>
                ))}
                {participants.length === 0 && (
                  <div className="col-span-full text-xs text-slate-500 italic">
                    Aún no hay otros participantes conectados.
                  </div>
                )}
              </div>
            </div>

            {/* Controles: micrófono + info llamada + cámara + colgar */}
            <div className="flex justify-center items-center gap-3 pt-2 border-t border-slate-700 flex-shrink-0">
              
              {/* Botón tres puntos: info llamada */}
              <button
                type="button"
                onClick={() => setShowCallInfo(true)}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                  />
                </svg>
              </button>
              
              {/* Mic */}
              <button className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 1a3 3 0 00-3 3v6a3 3 0 106 0V4a3 3 0 00-3-3zM5 10a7 7 0 0014 0M12 17v4m0 0H9m3 0h3"
                  />
                </svg>
              </button>

              {/* Cámara */}
              <button className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {/* Colgar */}
              <button
  onClick={() => setShowEndCallConfirm(true)}
  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 grid place-items-center transition-colors"
>
  <svg
    className="w-5 h-5 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
</button>

            </div>
          </div>
        </div>

        {/* Panel lateral SOLO escritorio: ahora SOLO si hay algo abierto */}
        {(showParticipantsPanel || showChatPanel) && (
          <div
            className={`
              hidden lg:flex
              flex-col min-h-0
              bg-slate-900 border border-slate-700
              lg:rounded-xl
              lg:h-auto lg:w-96
              p-3 lg:p-4
            `}
          >
            {/* Header pequeño del panel */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {participants.length} en la reunión
              </span>
            </div>

            {/* PANEL PARTICIPANTES escritorio */}
            {showParticipantsPanel && (
              <div
                className={`flex flex-col min-h-0 mb-3 ${
                  bothPanelsOpen ? "flex-[0.45]" : "flex-1"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 grid place-items-center">
                      <svg
                        className="w-3.5 h-3.5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 11a4 4 0 100-8 4 4 0 000 8zm0 0c-4.418 0-8 2.239-8 5v2h8m6-9a3 3 0 110-6 3 3 0 010 6z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm">
                      Participantes
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowParticipantsPanel(false)}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 rounded-lg bg-slate-900/60 border border-slate-700/80 p-2">
                  {participants.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Aún no hay más participantes conectados.
                    </p>
                  ) : (
                    participants.map((participant) => {
                      const isCurrentUser = participant.userId === user?.uid;

                      return (
                        <div
                          key={participant.socketId}
                          className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-xs font-semibold text-slate-950">
                            {getUserInitials(
                              participant.displayName ||
                                participant.email
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                              {participant.displayName ||
                                participant.email}
                              {isCurrentUser && (
                                <span className="ml-1 text-[10px] text-emerald-400 font-normal">
                                  (Tú)
                                </span>
                              )}
                            </p>
                            {participant.email && (
                              <p className="text-[11px] text-slate-400 truncate">
                                {participant.email}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-[2px] bg-emerald-400" />
                            <span className="text-[10px] text-emerald-300">
                              En línea
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* PANEL CHAT escritorio */}
            {showChatPanel && (
              <div
                className={`flex flex-col min-h-0 ${
                  bothPanelsOpen ? "flex-[0.55]" : "flex-1"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 grid place-items-center">
                      <svg
                        className="w-3.5 h-3.5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h8m-8 4h5M4 6h16v10H5.5L4 17.5V6z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm">
                      Chat en vivo
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowChatPanel(false)}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    ✕
                  </button>
                </div>

                {typingUsers.size > 0 && (
                  <div className="text-[11px] text-slate-400 mb-1">
                    {Array.from(typingUsers)
                      .filter((name) => name !== user?.displayName)
                      .join(", ")}{" "}
                    está escribiendo...
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0 rounded-lg bg-slate-900/60 border border-slate-700/80 p-2">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-6">
                      {socketError ? (
                        <div>
                          <div className="text-red-400 mb-2 text-xs">
                            ❌ {socketError}
                          </div>
                          <button
                            onClick={handleRetryConnection}
                            className="text-blue-400 hover:text-blue-300 underline text-xs"
                          >
                            Reintentar conexión
                          </button>
                        </div>
                      ) : (
                        "No hay mensajes aún. Inicia la conversación."
                      )}
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="text-xs">
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`font-medium ${
                              msg.userId === user?.uid
                                ? "text-blue-400"
                                : msg.type === "system"
                                ? "text-yellow-400"
                                : "text-slate-200"
                            }`}
                          >
                            {msg.displayName}
                            {msg.userId === user?.uid && " (Tú)"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`text-slate-300 rounded-lg px-2.5 py-2 leading-snug ${
                            msg.type === "system"
                              ? "bg-yellow-900/20 italic"
                              : msg.userId === user?.uid
                              ? "bg-blue-900/30"
                              : "bg-slate-800/60"
                          }`}
                        >
                          {msg.message}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (e.target.value.trim()) {
                        handleTyping();
                      }
                    }}
                    onBlur={handleStopTyping}
                    placeholder={
                      !isConnected
                        ? "Conectando al chat..."
                        : socketError
                        ? "Chat no disponible"
                        : "Escribe un mensaje..."
                    }
                    disabled={!isConnected || !!socketError}
                    className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={
                      !newMessage.trim() || !isConnected || !!socketError
                    }
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed grid place-items-center transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </form>
              </div>

              

            )}
          </div>
        )}
      </div>

      {/* VISTA MÓVIL FULLSCREEN PARTICIPANTES / CHAT */}
      {mobileView !== "call" && (
        <div className="fixed inset-0 z-40 bg-slate-950 lg:hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileView("call")}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 grid place-items-center text-slate-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-100">
                  {mobileView === "participants"
                    ? "Participantes"
                    : "Chat en vivo"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {participants.length} en la reunión
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mobileView === "participants" && (
                <button
                  type="button"
                  onClick={() => setMobileView("chat")}
                  className="text-[11px] px-3 py-1 rounded-full border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  Ir al chat
                </button>
              )}
              {mobileView === "chat" && (
                <button
                  type="button"
                  onClick={() => setMobileView("participants")}
                  className="text-[11px] px-3 py-1 rounded-full border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  Ver participantes
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 p-3 flex flex-col min-h-0">
            {mobileView === "participants" ? (
              <div className="flex-1 overflow-y-auto space-y-2 rounded-lg bg-slate-900/60 border border-slate-700/80 p-2">
                {participants.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Aún no hay más participantes conectados.
                  </p>
                ) : (
                  participants.map((participant) => {
                    const isCurrentUser = participant.userId === user?.uid;

                    return (
                      <div
                        key={participant.socketId}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-xs font-semibold text-slate-950">
                          {getUserInitials(
                            participant.displayName || participant.email
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                            {participant.displayName || participant.email}
                            {isCurrentUser && (
                              <span className="ml-1 text-[10px] text-emerald-400 font-normal">
                                (Tú)
                              </span>
                            )}
                          </p>
                          {participant.email && (
                            <p className="text-[11px] text-slate-400 truncate">
                              {participant.email}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-[2px] bg-emerald-400" />
                          <span className="text-[10px] text-emerald-300">
                            En línea
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {typingUsers.size > 0 && (
                  <div className="text-[11px] text-slate-400 mb-1">
                    {Array.from(typingUsers)
                      .filter((name) => name !== user?.displayName)
                      .join(", ")}{" "}
                    está escribiendo...
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0 rounded-lg bg-slate-900/60 border border-slate-700/80 p-2">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-6">
                      {socketError ? (
                        <div>
                          <div className="text-red-400 mb-2 text-xs">
                            ❌ {socketError}
                          </div>
                          <button
                            onClick={handleRetryConnection}
                            className="text-blue-400 hover:text-blue-300 underline text-xs"
                          >
                            Reintentar conexión
                          </button>
                        </div>
                      ) : (
                        "No hay mensajes aún. Inicia la conversación."
                      )}
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="text-xs">
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`font-medium ${
                              msg.userId === user?.uid
                                ? "text-blue-400"
                                : msg.type === "system"
                                ? "text-yellow-400"
                                : "text-slate-200"
                            }`}
                          >
                            {msg.displayName}
                            {msg.userId === user?.uid && " (Tú)"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`text-slate-300 rounded-lg px-2.5 py-2 leading-snug ${
                            msg.type === "system"
                              ? "bg-yellow-900/20 italic"
                              : msg.userId === user?.uid
                              ? "bg-blue-900/30"
                              : "bg-slate-800/60"
                          }`}
                        >
                          {msg.message}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (e.target.value.trim()) {
                        handleTyping();
                      }
                    }}
                    onBlur={handleStopTyping}
                    placeholder={
                      !isConnected
                        ? "Conectando al chat..."
                        : socketError
                        ? "Chat no disponible"
                        : "Escribe un mensaje..."
                    }
                    disabled={!isConnected || !!socketError}
                    className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={
                      !newMessage.trim() || !isConnected || !!socketError
                    }
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed grid place-items-center transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Confirmar fin de llamada */}
      {showEndCallConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowEndCallConfirm(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
             
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-slate-50">
                  Finalizar llamada
                </h2>
                <p className="text-xs text-slate-400">
                  Si finalizas la llamada saldrás de la reunión y dejarás de estar visible para los demás participantes.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowEndCallConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-600 text-xs sm:text-sm text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndCallConfirm(false);
                  handleEndCall();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs sm:text-sm text-white font-medium transition-colors"
              >
                Finalizar llamada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFO DE LA LLAMADA */}
{showCallInfo && (
  <div
    className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center px-4"
    onClick={() => setShowCallInfo(false)}
  >
    <div
      className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-400">Información de la llamada</p>
          <h2 className="text-sm sm:text-base font-semibold text-slate-50">
            {meeting?.title || "Reunión sin título"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowCallInfo(false)}
          className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 grid place-items-center text-slate-300 text-xs border border-slate-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between gap-2">
  <span className="text-slate-400">Código de reunión</span>

  <button
    type="button"
    onClick={handleCopyMeetingCode}
    className="flex items-center gap-1 font-mono text-slate-100 text-[11px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors"
  >
    <span>{meetingId || "N/D"}</span>
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
        d="M8 16h8a2 2 0 002-2V7M8 16a2 2 0 01-2-2V7m2 9h8m-8 0l-2 2m10-11a2 2 0 00-2-2h-5m7 2V5a2 2 0 00-2-2h-5m0 0L7 5m3-2v3"
      />
    </svg>
  </button>
</div>


        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-400">Participantes actuales</span>
          <span className="text-slate-100">
            {participants.length} en la llamada
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-400">Estado</span>
          <span className="text-slate-100">
            {meeting?.status || "N/D"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-400">Creada</span>
          <span className="text-slate-100">
            {formatDateTime(meeting?.createdAt)}
          </span>
        </div>

        {meeting?.scheduledAt && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Programada para</span>
            <span className="text-slate-100">
              {formatDateTime(meeting.scheduledAt)}
            </span>
          </div>
        )}

        
      </div>
    </div>
  </div>
)}
 </div>
  );
}
