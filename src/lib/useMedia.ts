// src/lib/useMedia.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Peer, { MediaConnection, DataConnection } from "peerjs";

type RemoteStream = {
    userId: string;
    stream: MediaStream;
};

type RemotePeerState = {
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
};

type UseMediaOptions = {
    meetingId: string;
    userId: string;
};

type UseMediaReturn = {
    localStream: MediaStream | null;
    remoteStreams: RemoteStream[];
    remotePeerStates: Record<string, RemotePeerState>;
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
    toggleMic: () => boolean;
    toggleCamera: () => boolean;
    error: string | null;
};

export function useMedia({ meetingId, userId }: UseMediaOptions): UseMediaReturn {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
    const [remotePeerStates, setRemotePeerStates] = useState<Record<string, RemotePeerState>>({});

    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const callsRef = useRef<Map<string, MediaConnection>>(new Map());
    const dataConnectionsRef = useRef<Map<string, DataConnection>>(new Map()); // P2P Data Channels
    const localStreamRef = useRef<MediaStream | null>(null);

    // Broadcast Helpers 
    const broadcastState = (newState: Partial<RemotePeerState>) => {
        const payload = {
            type: 'voice:state-change',
            userId,
            ...newState
        };
        console.log("[media-hook] 📡 Broadcasting P2P state:", payload);

        dataConnectionsRef.current.forEach((conn) => {
            if (conn.open) {
                conn.send(payload);
            }
        });

        // Backup socket emit 
        if (socketRef.current) {
            socketRef.current.emit("voice:state-change", {
                meetingId,
                userId,
                ...newState
            });
        }
    };

    const handleData = (data: any) => {
        if (data && data.type === 'voice:state-change') {
            console.log("[media-hook] 📥 Received P2P state:", data);
            setRemotePeerStates(prev => ({
                ...prev,
                [data.userId]: {
                    isMicEnabled: data.isMicEnabled ?? prev[data.userId]?.isMicEnabled ?? true,
                    isCameraEnabled: data.isCameraEnabled ?? prev[data.userId]?.isCameraEnabled ?? true
                }
            }));
        }
    };

    useEffect(() => {
        let cancelled = false;

        console.log("[media-hook] 🚀 Initializing media connection (P2P Data + Media)...", {
            meetingId,
            userId,
        });

        if (!meetingId || !userId) return;

        async function initMedia() {
            try {
                // 1) Media (fallback logic)
                let stream: MediaStream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                    });
                } catch (originalErr: any) {
                    console.warn("⚠️ Combined GUM failed:", originalErr.name);

                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
                    const videoStream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
                    }).catch(() => null);

                    if (audioStream && videoStream) {
                        stream = new MediaStream([...audioStream.getTracks(), ...videoStream.getTracks()]);
                    } else if (audioStream) {
                        stream = audioStream;
                        setIsCameraEnabled(false);
                    } else if (videoStream) {
                        stream = videoStream;
                        setIsMicEnabled(false);
                    } else {
                        throw originalErr;
                    }
                }

                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                localStreamRef.current = stream;
                setLocalStream(stream);
                (window as any).__localMediaStream = stream;

                // 2) Socket
                const isProd = import.meta.env.PROD;
                const serverUrl = import.meta.env.VITE_VOICE_SERVER_URL || (isProd ? "" : "http://localhost:4002");
                const socket = io(serverUrl, { transports: ["polling"] });
                socketRef.current = socket;

                // 3) PeerJS
                const peerId = `${userId}-${Date.now()}`;
                const peerHost = isProd ? (import.meta.env.VITE_PEER_HOST || "linkup-voice-server.onrender.com") : "localhost";
                const peerPort = isProd ? (import.meta.env.VITE_PEER_PORT ? Number(import.meta.env.VITE_PEER_PORT) : undefined) : 4002;
                const peerPath = import.meta.env.VITE_PEER_PATH || "/peerjs";
                const peerSecure = isProd ? (import.meta.env.VITE_PEER_SECURE || "true") === "true" : false;

                const peer = new Peer(peerId, {
                    host: peerHost,
                    port: peerPort,
                    path: peerPath,
                    secure: peerSecure,
                });

                peerRef.current = peer;

                peer.on("open", (id) => {
                    console.log("[media-hook] ✅ Peer open:", id);
                    socket.emit("voice:join-room", { meetingId, userId, peerId: id });
                });

                // A) Incoming Data Connection
                peer.on('connection', (conn) => {
                    console.log("[media-hook] 🔗 Incoming Data Connection from:", conn.peer);

                    conn.on('open', () => {
                        // Save conection 
                        // Note: we need the remote userId. 
                        // PeerJS Metadata is useful here, but if not, we use the temporary peerId or wait for the first message.
                        // We will assume that we send metadata { userId } when connecting.
                        const remoteUserId = (conn.metadata as any)?.userId;
                        if (remoteUserId) {
                            console.log("[media-hook] 🔗 Data Channel Open for user:", remoteUserId);
                            dataConnectionsRef.current.set(remoteUserId, conn);

                            // Enviar MI estado actual inmediatamente
                            conn.send({
                                type: 'voice:state-change',
                                userId,
                                isMicEnabled,
                                isCameraEnabled
                            });
                        }
                    });

                    conn.on('data', handleData);

                    conn.on('close', () => {
                        const remoteUserId = (conn.metadata as any)?.userId;
                        if (remoteUserId) dataConnectionsRef.current.delete(remoteUserId);
                    });
                });

                // B) Incoming Media Call
                peer.on("call", (call) => {
                    const myStream = localStreamRef.current;
                    if (!myStream) return;
                    call.answer(myStream);

                    const remoteUserId = (call.metadata as any)?.userId ?? call.peer;

                    call.on("stream", (remoteStream) => {
                        setRemoteStreams((prev) => {
                            const filtered = prev.filter((rs) => rs.userId !== remoteUserId);
                            return [...filtered, { userId: remoteUserId, stream: remoteStream }];
                        });
                    });

                    callsRef.current.set(call.peer, call);
                });

                // C) Socket Events
                socket.on("voice:user-joined", ({ userId: remoteUserId, peerId }: { userId: string; peerId: string }) => {
                    console.log("[media-hook] 📞 voice:user-joined found:", remoteUserId);

                    const myStream = localStreamRef.current;
                    if (!myStream || !peerRef.current) return;

                    // 1. Establish Media Call
                    if (!callsRef.current.has(peerId)) {
                        const call = peerRef.current.call(peerId, myStream, { metadata: { userId } });
                        call.on("stream", (remoteStream) => {
                            setRemoteStreams((prev) => {
                                const filtered = prev.filter((rs) => rs.userId !== remoteUserId);
                                return [...filtered, { userId: remoteUserId, stream: remoteStream }];
                            });
                        });
                        callsRef.current.set(peerId, call);
                    }

                    // 2. Establish Data Connection for signaling
                    if (!dataConnectionsRef.current.has(remoteUserId)) {
                        console.log("[media-hook] 🔗 Initiating Data Connection to:", remoteUserId);
                        const conn = peerRef.current.connect(peerId, { metadata: { userId } });

                        conn.on('open', () => {
                            console.log("[media-hook] 🔗 Outgoing Data Channel Open to:", remoteUserId);
                            dataConnectionsRef.current.set(remoteUserId, conn);

                            // Enviar MI estado inicial
                            conn.send({
                                type: 'voice:state-change',
                                userId,
                                isMicEnabled,
                                isCameraEnabled
                            });
                        });

                        conn.on('data', handleData);
                        conn.on('close', () => dataConnectionsRef.current.delete(remoteUserId));
                    }
                });

                socket.on("voice:user-left", ({ peerId }) => {
                    // Basic cleanup (more difficult to map peerId to userId if we don't save both, 
                    // but callsRef uses peerId and remoteStreams userId... legacy code is a bit messy).
                    // We will assume that the stream filtering works by userId
                    // For dataConnections we use userId.
                    // If we only receive peerId, we don't know which userId to delete from dataConnections without an inverse map.
                    // But it's not critical, it will close itself.
                    const call = callsRef.current.get(peerId);
                    if (call) call.close();
                    callsRef.current.delete(peerId);
                });

                // Escuchar también el evento socket (legacy fallback)
                socket.on("voice:state-change", handleData);

            } catch (error: any) {
                console.error("[media-hook] ❌ Error initializing:", error);

                // Categorizar error
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setError("Permiso denegado para acceder a cámara/micrófono");
                } else if (error.name === 'NotFoundError') {
                    setError("No se encontró dispositivo de cámara o micrófono");
                } else {
                    setError(error.message || "Error al acceder a dispositivos multimedia");
                }
            }
        }

        initMedia();

        return () => {
            cancelled = true;
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            peerRef.current?.destroy();
            socketRef.current?.disconnect();

            callsRef.current.forEach((call) => call.close());
            callsRef.current.clear();

            dataConnectionsRef.current.forEach((conn) => conn.close());
            dataConnectionsRef.current.clear();
        };
    }, [meetingId, userId]);

    const toggleMic = () => {
        const stream = localStreamRef.current;
        if (!stream) {
            return false; // Indicamos fallo
        }

        const enabled = !isMicEnabled;
        setIsMicEnabled(enabled);
        stream.getAudioTracks().forEach((t) => t.enabled = enabled);

        // Broadcast  P2P
        broadcastState({ isMicEnabled: enabled, isCameraEnabled });
        return true;
    };

    const toggleCamera = () => {
        const stream = localStreamRef.current;
        if (!stream) {
            return false;
        }

        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) return false;

        const enabled = !isCameraEnabled;
        setIsCameraEnabled(enabled);
        videoTracks.forEach((t) => t.enabled = enabled);

        // Broadcast P2P
        broadcastState({ isMicEnabled, isCameraEnabled: enabled });
        return true;
    };

    return {
        localStream,
        remoteStreams,
        remotePeerStates,
        isMicEnabled,
        isCameraEnabled,
        toggleMic,
        toggleCamera,
        error
    };
}
