// src/lib/useVoice.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Peer, { MediaConnection } from "peerjs";

type RemoteStream = {
  userId: string;
  stream: MediaStream;
};

type UseVoiceOptions = {
  meetingId: string;
  userId: string;
};

type UseVoiceReturn = {
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
  isMicEnabled: boolean;
  toggleMic: () => void;
};

/**
 * Hook para voz en tiempo real usando:
 * - Socket.IO (para coordinar sala / quién entra / quién sale)
 * - PeerJS (para el audio P2P entre navegadores)
 */
export function useVoice({ meetingId, userId }: UseVoiceOptions): UseVoiceReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    console.log("[voice-hook] 🚀 Initializing voice connection...", {
      meetingId,
      userId,
    });

    if (!meetingId || !userId) {
      console.warn(
        "[voice-hook] ❗ Missing meetingId or userId. Skipping voice initialization."
      );
      return;
    }

    async function initVoice() {
      try {
        // 1) Pedir micrófono
        console.log("[voice-hook] 🎤 Requesting microphone permission...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        console.log("[voice-hook] ✅ Microphone access granted");
        console.log("[voice-hook] Audio tracks:", stream.getAudioTracks().length);

        localStreamRef.current = stream;
        setLocalStream(stream);
        (window as any).__voiceLocalStream = stream;

        const voiceUrl = import.meta.env.VITE_VOICE_SERVER_URL;

        console.log("[voice-hook] 🔧 Using voice server:", voiceUrl);

        const socket = io(voiceUrl, {
          transports: ["websocket"],
        });


        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("[voice-hook] ✅ Socket connected:", socket.id);
        });

        socket.on("connect_error", (err) => {
          console.error("[voice-hook] ❌ Socket connect_error:", err);
        });

        socket.on("disconnect", (reason) => {
          console.warn("[voice-hook] ⚠️ Socket disconnected:", reason);
        });

        socket.on("voice:ready", (payload) => {
          console.log("[voice-hook] ✅ Voice server acknowledged connection:", payload);
        });

        // 3) Crear instancia de PeerJS apuntando al peer-server (4003)
        const peerId = `${userId}-${Date.now()}`;
        console.log("[voice-hook] 🔗 Creating PeerJS instance with ID:", peerId);

        const peerHost = import.meta.env.VITE_PEER_HOST;
        const peerPort = import.meta.env.VITE_PEER_PORT;
        const peerSecure = import.meta.env.VITE_PEER_SECURE === "true";

        console.log("[voice-hook] 🔧 Peer connection:", { peerHost, peerPort, peerSecure });

        const peer = new Peer(peerId, {
          host: peerHost,
          port: peerPort ? Number(peerPort) : undefined, // si viene vacío usa 443
          path: import.meta.env.VITE_PEER_PATH || "/peerjs",
          secure: peerSecure,
          config: {
            iceServers: [
              {
                urls: [`stun:${import.meta.env.VITE_STUN_HOST}:${import.meta.env.VITE_STUN_PORT}`],
              },
          ],
       },
    });


        peerRef.current = peer;

        peer.on("open", (id) => {
          console.log("[voice-hook] ✅ Peer open:", id);

          // Anunciarse en la sala de voz
          socket.emit("voice:join-room", {
            meetingId,
            userId,
            peerId: id,
          });
        });

        peer.on("error", (err) => {
          console.error("[voice-hook] ❌ Peer error:", err);
        });

        peer.on("close", () => {
          console.warn("[voice-hook] ⚠️ Peer closed");
        });

        // 4) Cuando alguien ME llama (entrante)
        peer.on("call", (call: MediaConnection) => {
          console.log("[voice-hook] 📞 Incoming call from", call.peer);
          const myStream = localStreamRef.current;
          if (!myStream) {
            console.warn("[voice-hook] No local stream to answer incoming call");
            return;
          }

          call.answer(myStream);

          call.on("stream", (remoteStream) => {
            const remoteUserId =
              (call.metadata as any)?.userId ?? call.peer ?? "unknown";

            console.log(
              "[voice-hook] 🔊 Incoming remote stream from",
              remoteUserId
            );

            setRemoteStreams((prev) => {
              const filtered = prev.filter((rs) => rs.userId !== remoteUserId);
              return [...filtered, { userId: remoteUserId, stream: remoteStream }];
            });
          });

          call.on("close", () => {
            console.log("[voice-hook] 📴 Incoming call closed", call.peer);
            setRemoteStreams((prev) =>
              prev.filter((rs) => rs.userId !== call.peer)
            );
            callsRef.current.delete(call.peer);
          });

          call.on("error", (err) => {
            console.error("[voice-hook] ❌ Incoming call error", err);
          });

          callsRef.current.set(call.peer, call);
        });

        // 5) Cuando el servidor avisa que OTRO usuario se unió
        socket.on(
          "voice:user-joined",
          ({ userId: remoteUserId, peerId }: { userId: string; peerId: string }) => {
            console.log("[voice-hook] 📞 voice:user-joined", {
              remoteUserId,
              peerId,
            });

            const myStream = localStreamRef.current;
            const peerInstance = peerRef.current;

            if (!myStream || !peerInstance) {
              console.warn(
                "[voice-hook] No local stream or peer instance when voice:user-joined"
              );
              return;
            }

            // Evitar duplicados
            if (callsRef.current.has(peerId)) {
              console.log(
                "[voice-hook] Call to this peer already exists, skipping",
                peerId
              );
              return;
            }

            const outgoingCall = peerInstance.call(peerId, myStream, {
              metadata: { userId },
            });

            if (!outgoingCall) {
              console.warn(
                "[voice-hook] peer.call() returned null/undefined for",
                peerId
              );
              return;
            }

            outgoingCall.on("stream", (remoteStream) => {
              console.log(
                "[voice-hook] 🔊 Outgoing remote stream from",
                remoteUserId
              );
              setRemoteStreams((prev) => {
                const filtered = prev.filter(
                  (rs) => rs.userId !== remoteUserId
                );
                return [...filtered, { userId: remoteUserId, stream: remoteStream }];
              });
            });

            outgoingCall.on("close", () => {
              console.log(
                "[voice-hook] 📴 Outgoing call closed",
                remoteUserId
              );
              setRemoteStreams((prev) =>
                prev.filter((rs) => rs.userId !== remoteUserId)
              );
              callsRef.current.delete(peerId);
            });

            outgoingCall.on("error", (err) => {
              console.error("[voice-hook] ❌ Outgoing call error", err);
            });

            callsRef.current.set(peerId, outgoingCall);
          }
        );

        // 6) Cuando alguien sale de la sala
        socket.on("voice:user-left", ({ peerId }: { peerId: string }) => {
          console.log("[voice-hook] 👋 voice:user-left", { peerId });

          const call = callsRef.current.get(peerId);
          if (call) {
            call.close();
            callsRef.current.delete(peerId);
          }

          setRemoteStreams((prev) => prev.filter((rs) => rs.userId !== peerId));
        });
      } catch (error) {
        console.error("[voice-hook] ❌ Error initializing voice:", error);
      }
    }

    initVoice();

    return () => {
      console.log("[voice-hook] 🧹 Cleaning up...");
      cancelled = true;

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setRemoteStreams([]);

      peerRef.current?.destroy();
      peerRef.current = null;

      socketRef.current?.disconnect();
      socketRef.current = null;

      callsRef.current.forEach((call) => call.close());
      callsRef.current.clear();

      console.log("[voice-hook] ✅ Cleanup complete");
    };
  }, [meetingId, userId]);

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const enabled = !isMicEnabled;
    console.log("[voice-hook] 🎤 Toggling microphone:", enabled ? "ON" : "OFF");

    stream.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });

    setIsMicEnabled(enabled);
  };

  return {
    localStream,
    remoteStreams,
    isMicEnabled,
    toggleMic,
  };
}
