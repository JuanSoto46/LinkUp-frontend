import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { socketService } from "../lib/socket";

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
 * Displays the main meeting layout, including:
 * - fake video area
 * - real-time participants list
 * - live chat panel
 * and manages the Socket.IO connection lifecycle.
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

  // ✅ Real participants state for the meeting
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Scroll the chat panel to the last message whenever
   * the messages list changes.
   */
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  /**
   * Subscribe to Firebase Auth changes to keep
   * a fresh reference to the current user.
   */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  /**
   * Load meeting data when there is a meetingId in the URL.
   */
  useEffect(() => {
    if (meetingId) {
      loadMeetingData();
    } else {
      setError("No se proporcionó ID de reunión");
      setLoading(false);
    }
  }, [meetingId]);

  /**
   * Once meeting + user + meetingId are available,
   * initialize the real-time chat socket.
   */
  useEffect(() => {
    if (meeting && user && meetingId) {
      initializeSocket();
    }

    return () => {
      socketService.disconnect();
    };
  }, [meeting, user, meetingId]);

  /**
   * Initialize the Socket.IO connection and register all real-time listeners.
   *
   * Flow:
   * 1. Connect to chat server.
   * 2. Clear previous listeners.
   * 3. Register listeners for messages, user events, typing and errors.
   * 4. Join the meeting room.
   *
   * This order avoids race conditions and ensures the UI
   * reacts quickly once `meeting_joined` is emitted.
   */
  const initializeSocket = async () => {
    try {
      console.log("🔄 Inicializando socket...");
      setSocketError(null);

      // ✅ Connect FIRST so there is an active socket instance
      console.log("🔗 Conectando al servidor de chat...");
      await socketService.connect();

      // ✅ Then clean previous listeners (if any)
      socketService.removeAllListeners();

      // ✅ Message listener - avoid duplicates by id
      socketService.onMessage((message: ChatMessage) => {
        console.log("📨 Nuevo mensaje recibido:", message);
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      });

      // ✅ User join/leave events
      socketService.onUserEvent((event) => {
        console.log("👤 Usuario evento:", event);

        if (event.type === "user_joined") {
          if (event.participants) {
            const uniqueParticipants = Array.from(
              new Map(
                event.participants.map((p: any) => [p.userId, p])
              ).values()
            );
            setParticipants(uniqueParticipants);
          }

          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}-${Math.random()}`,
            userId: "system",
            displayName: "Sistema",
            message: `${event.displayName} se unió a la reunión`,
            type: "system",
            timestamp: event.timestamp || new Date().toISOString(),
          };
          setChatMessages((prev) => [...prev, systemMessage]);
        } else if (event.type === "user_left") {
          if (event.participants) {
            const uniqueParticipants = Array.from(
              new Map(
                event.participants.map((p: any) => [p.userId, p])
              ).values()
            );
            setParticipants(uniqueParticipants);
          }

          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}-${Math.random()}`,
            userId: "system",
            displayName: "Sistema",
            message: `${event.displayName} salió de la reunión`,
            type: "system",
            timestamp: event.timestamp || new Date().toISOString(),
          };
          setChatMessages((prev) => [...prev, systemMessage]);
        }
      });

      // ✅ Typing start
      socketService.getSocket()?.on(
        "user_typing",
        (data: { userId: string; displayName: string }) => {
          console.log("⌨️ Usuario escribiendo:", data);
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.displayName) {
              newSet.add(data.displayName);
            }
            return newSet;
          });
        }
      );

      // ✅ Typing stop
      socketService.getSocket()?.on(
        "user_stop_typing",
        (data: { userId: string }) => {
          console.log("⌨️ Usuario dejó de escribir:", data);
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            const userToRemove = participants.find(
              (p) => p.userId === data.userId
            );
            if (userToRemove) {
              newSet.delete(userToRemove.displayName);
            }
            return newSet;
          });
        }
      );

      // ✅ Socket-level errors
      socketService.onError((error) => {
        console.error("❌ Error del socket:", error);
        setSocketError(
          error.message || "Error de conexión con el chat"
        );
      });

      // ✅ Meeting join confirmation
      socketService.onMeetingJoined((data) => {
        console.log("✅ Unido a la reunión:", data);
        setIsConnected(true);
        setSocketError(null);

        if (data.participants) {
          const uniqueParticipants = Array.from(
            new Map(
              data.participants.map((p: any) => [p.userId, p])
            ).values()
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
      });

      console.log("🎯 Uniéndose a la reunión:", meetingId);
      await socketService.joinMeeting(meetingId!);
    } catch (error: any) {
      console.error("❌ Error inicializando socket:", error);
      setSocketError(
        error.message || "No se pudo conectar al chat en tiempo real"
      );
      setIsConnected(false);
    }
  };

  /**
   * Load meeting information from the REST API.
   * Requires the user to be authenticated.
   */
  const loadMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📋 Cargando datos de la reunión:", meetingId);

      const response = await api.getMeeting(meetingId!);

      if (response.success) {
        console.log("✅ Reunión cargada:", response.meeting);
        setMeeting(response.meeting);
      } else {
        const errorMsg =
          "No se pudo cargar la información de la reunión";
        console.error("❌", errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("❌ Error loading meeting:", err);
      const errorMsg =
        "Error al cargar la reunión: " +
        (err.message || "Error desconocido");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Build initials for a user display name or email.
   *
   * @param name Optional display name override.
   * @returns Up to two initials.
   */
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

  /**
   * Handle chat message send action.
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (socketService.isConnected()) {
        console.log("📤 Enviando mensaje:", newMessage);
        await socketService.sendMessage(newMessage);
        setNewMessage("");
      } else {
        throw new Error("No conectado al servidor");
      }
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      setSocketError("Error al enviar mensaje");
    }
  };

  /**
   * Handle typing indicator with a debounce.
   * Starts typing state and auto-stops after 3 seconds of inactivity.
   */
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

  /**
   * Force stop typing indicator when the input loses focus.
   */
  const handleStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socketService.isConnected()) {
      socketService.stopTyping();
    }
  };

  /**
   * End the current call and navigate back to the meetings page.
   */
  const handleEndCall = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres finalizar la llamada?"
      )
    ) {
      socketService.disconnect();
      navigate("/meetings");
    }
  };

  /**
   * Retry socket initialization when there is a connection error.
   */
  const handleRetryConnection = () => {
    setSocketError(null);
    if (meetingId) {
      initializeSocket();
    }
  };

  /**
   * Format a timestamp into a short time string (HH:mm).
   */
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---------- UI STATES ----------

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

  // ---------- MAIN LAYOUT ----------

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full grid place-items-center ${
                    isConnected
                      ? "bg-green-500"
                      : socketError
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {isConnected
                      ? "En reunión"
                      : socketError
                      ? "Error de conexión"
                      : "Conectando..."}
                  </span>
                  {socketError && (
                    <button
                      onClick={handleRetryConnection}
                      className="text-xs text-blue-400 hover:text-blue-300 ml-2 underline"
                    >
                      Reintentar
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden md:block border-l border-slate-600 h-6"></div>

              <div className="hidden md:block">
                <h1 className="text-sm font-semibold">
                  {meeting?.title || "Reunión sin título"}
                </h1>
                <p className="text-xs text-slate-300">
                  {participants.length} participantes
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/meetings")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors text-sm"
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
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Section */}
          <div className="lg:flex-1">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
              {/* Video principal */}
              <div className="aspect-video bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500 grid place-items-center text-2xl font-semibold text-slate-900 mx-auto mb-4">
                    {getUserInitials()}
                  </div>
                  <p className="text-slate-300">
                    Tu video aparecerá aquí
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isConnected ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {isConnected
                      ? "✅ Conectado"
                      : "🔄 Conectando..."}
                  </p>
                </div>
              </div>

              {/* ✅ Real participants */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {participants.map((participant) => (
                  <div
                    key={participant.socketId}
                    className="bg-slate-800 rounded-lg p-3 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 grid place-items-center text-white font-semibold text-sm mx-auto mb-2">
                      {getUserInitials(participant.displayName)}
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                      {participant.displayName}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] text-green-400">
                        En línea
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center gap-4">
                <button className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>

                <button className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 grid place-items-center transition-colors">
                  <svg
                    className="w-6 h-6 text-white"
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

                <button
                  onClick={handleEndCall}
                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 grid place-items-center transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-white"
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

          {/* Chat Section */}
          <div className="lg:w-80">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
              <h3 className="font-semibold text-slate-200 mb-3 flex items-center justify-between">
                <span>Chat en vivo</span>
                <span className="text-xs text-slate-400">
                  {participants.length} online
                </span>
              </h3>

              {typingUsers.size > 0 && (
                <div className="text-xs text-slate-400 mb-2 italic">
                  {Array.from(typingUsers).join(", ")} está
                  escribiendo...
                </div>
              )}

              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-3 mb-3 px-1">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-8">
                    {socketError ? (
                      <div>
                        <div className="text-red-400 mb-2">
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
                      "No hay mensajes aún"
                    )}
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`font-medium text-xs ${
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
                        <span className="text-xs text-slate-400">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`text-slate-300 text-xs rounded-lg p-2 ${
                          msg.type === "system"
                            ? "bg-yellow-900/20 italic"
                            : msg.userId === user?.uid
                            ? "bg-blue-900/30"
                            : "bg-slate-800/50"
                        }`}
                      >
                        {msg.message}
                      </p>
                    </div>
                  ))
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
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
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 rounded-lg px-3 py-2 text-white transition-colors"
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
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
