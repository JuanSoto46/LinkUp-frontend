/**
 * Socket.IO client service for real-time chat
 * @module SocketService
 */

import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { auth } from "./firebase";

// Types para TypeScript
export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  message: string;
  type: "text" | "system";
  timestamp: string;
}

export interface UserEvent {
  type?: 'user_joined' | 'user_left'; // ✅ Agregado para distinguir eventos
  userId: string;
  displayName: string;
  email?: string;
  participants?: any[]; // ✅ Lista completa de participantes
  participantsCount: number;
  timestamp: string;
}

export interface MeetingJoinedData {
  meetingId: string;
  participants: any[];
  participantsCount: number;
  meetingTitle: string;
}

class SocketService {
  private socket: Socket | null = null;
  private meetingId: string | null = null;
  private isConnecting = false;

  /**
   * Connect to the chat server
   */
  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket);
          } else if (!this.isConnecting) {
            reject(new Error("Connection failed"));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be authenticated to connect to chat");
      }

      const token = await user.getIdToken();

      const serverUrl =
        import.meta.env.VITE_CHAT_SERVER_URL || "http://localhost:3001";

      console.log("🔗 Connecting to chat server:", serverUrl);

      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        const onConnect = () => {
          console.log("✅ Successfully connected to chat server");
          cleanup();
          resolve(this.socket!);
        };

        const onConnectError = (error: Error) => {
          console.error("❌ Connection error:", error);
          cleanup();
          reject(error);
        };

        const cleanup = () => {
          this.socket?.off("connect", onConnect);
          this.socket?.off("connect_error", onConnectError);
        };

        this.socket?.on("connect", onConnect);
        this.socket?.on("connect_error", onConnectError);

        setTimeout(() => {
          cleanup();
          reject(new Error("Connection timeout"));
        }, 10000);
      });
    } catch (error) {
      console.error("❌ Failed to connect to chat server:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Set up socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("🔗 Socket connected");
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("❌ Socket connection error:", error);
    });

    this.socket.on("error", (error: any) => {
      console.error("❌ Socket error:", error);
    });
  }

  /**
   * Join a meeting room
   */
  async joinMeeting(meetingId: string): Promise<void> {
    try {
      const socket = await this.connect();
      this.meetingId = meetingId;

      socket.emit("join_meeting", { meetingId });

      console.log(`✅ Join meeting request sent: ${meetingId}`);

      return new Promise((resolve, reject) => {
        const onMeetingJoined = (data: MeetingJoinedData) => {
          if (data.meetingId === meetingId) {
            cleanup();
            console.log(`✅ Successfully joined meeting: ${meetingId}`);
            resolve();
          }
        };

        const onError = (error: any) => {
          if (error?.message) {
            cleanup();
            reject(new Error(error.message));
          }
        };

        const cleanup = () => {
          this.socket?.off("meeting_joined", onMeetingJoined);
          this.socket?.off("error", onError);
        };

        this.socket?.on("meeting_joined", onMeetingJoined);
        this.socket?.on("error", onError);

        setTimeout(() => {
          cleanup();
          reject(new Error("Join meeting timeout"));
        }, 10000);
      });
    } catch (error) {
      console.error("❌ Failed to join meeting:", error);
      throw error;
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.socket || !this.meetingId) {
      throw new Error("Must join a meeting before sending messages");
    }

    this.socket.emit("send_message", {
      meetingId: this.meetingId,
      message: message,
      type: "text",
    });

    console.log(`📨 Message sent: ${message.substring(0, 50)}...`);
  }

  /**
   * Notify others that user is typing
   */
  startTyping(): void {
    if (this.socket && this.meetingId) {
      this.socket.emit("typing_start", { meetingId: this.meetingId });
    }
  }

  /**
   * Notify others that user stopped typing
   */
  stopTyping(): void {
    if (this.socket && this.meetingId) {
      this.socket.emit("typing_stop", { meetingId: this.meetingId });
    }
  }

  /**
   * Listen for new messages
   */
  onMessage(callback: (message: ChatMessage) => void): void {
    this.socket?.on("new_message", callback);
  }

  /**
   * ✅ CORREGIDO: Listen for user join/leave events
   * Ahora maneja ambos eventos por separado y agrega el tipo de evento
   */
  onUserEvent(callback: (event: UserEvent) => void): void {
    // User joined
    this.socket?.on("user_joined", (data: any) => {
      callback({
        ...data,
        type: 'user_joined' // ✅ Agregar tipo de evento
      });
    });

    // User left
    this.socket?.on("user_left", (data: any) => {
      callback({
        ...data,
        type: 'user_left' // ✅ Agregar tipo de evento
      });
    });
  }

  /**
   * Listen for typing indicators
   */
  onTyping(
    callback: (data: { userId: string; displayName?: string }) => void
  ): void {
    this.socket?.on("user_typing", callback);
    this.socket?.on("user_stop_typing", callback);
  }

  /**
   * Listen for errors
   */
  onError(callback: (error: any) => void): void {
    this.socket?.on("error", callback);
  }

  /**
   * Listen for meeting join confirmation
   */
  onMeetingJoined(callback: (data: MeetingJoinedData) => void): void {
    this.socket?.on("meeting_joined", callback);
  }

  /**
   * Remove specific event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  /**
   * ✅ MEJORADO: Remove all event listeners de manera más específica
   */
  removeAllListeners(): void {
    if (!this.socket) return;

    // Remover listeners específicos de la aplicación
    this.socket.off("new_message");
    this.socket.off("user_joined");
    this.socket.off("user_left");
    this.socket.off("user_typing");
    this.socket.off("user_stop_typing");
    this.socket.off("meeting_joined");
    this.socket.off("error");

    console.log("🧹 Removed all event listeners");
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      console.log("🔌 Disconnecting from chat server");
      this.removeAllListeners(); // ✅ Limpiar listeners antes de desconectar
      this.socket.disconnect();
      this.socket = null;
      this.meetingId = null;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Get current meeting ID
   */
  getMeetingId(): string | null {
    return this.meetingId;
  }
}

// Export singleton instance
export const socketService = new SocketService();