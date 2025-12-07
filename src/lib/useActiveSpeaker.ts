// src/lib/useActiveSpeaker.ts
import { useEffect, useRef, useState } from "react";

type RemoteStream = {
  userId: string;
  stream: MediaStream;
};

type UseActiveSpeakerOptions = {
  localUserId: string;
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
  /**
   * Volumen mínimo para considerar que alguien "está hablando".
   * Puedes subir o bajar este valor si se ilumina demasiado.
   */
  threshold?: number;
};

type ActiveSpeakerState = {
  activeSpeakerId: string | null;
  speakingUserIds: Set<string>;
};

export function useActiveSpeaker({
  localUserId,
  localStream,
  remoteStreams,
  threshold = 0.08,
}: UseActiveSpeakerOptions): ActiveSpeakerState {
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [speakingUserIds, setSpeakingUserIds] = useState<Set<string>>(
    () => new Set()
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserMapRef = useRef<
    Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }>
  >(new Map());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const AC =
      (window as any).AudioContext || (window as any).webkitAudioContext;

    if (!audioContextRef.current && AC) {
      audioContextRef.current = new AC();
    }

    const audioContext = audioContextRef.current;
    if (!audioContext) {
      console.warn("[useActiveSpeaker] AudioContext no disponible");
      return;
    }

    const attachStream = (userId: string, stream: MediaStream) => {
      if (analyserMapRef.current.has(userId)) return;
      if (!stream.getAudioTracks().length) return;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      source.connect(analyser);
      analyserMapRef.current.set(userId, { analyser, source });
    };

    // Local
    if (localStream) {
      attachStream(localUserId, localStream);
    } else {
      const entry = analyserMapRef.current.get(localUserId);
      if (entry) {
        entry.source.disconnect();
        analyserMapRef.current.delete(localUserId);
      }
    }

    // Remotos
    const remoteIds = new Set(remoteStreams.map((r) => r.userId));
    remoteStreams.forEach(({ userId, stream }) => {
      attachStream(userId, stream);
    });

    // Limpiar los que ya no están
    for (const [userId, entry] of analyserMapRef.current.entries()) {
      if (userId === localUserId) continue;
      if (!remoteIds.has(userId)) {
        entry.source.disconnect();
        analyserMapRef.current.delete(userId);
      }
    }

    // Loop de análisis
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    const speaking = new Set<string>();

    const analyze = () => {
      let maxVolume = 0;
      let currentActive: string | null = null;

      for (const [userId, { analyser }] of analyserMapRef.current.entries()) {
        const buffer = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(buffer);

        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = (buffer[i] - 128) / 128; // -1..1
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buffer.length); // 0..1 aprox

        if (rms > threshold) {
          speaking.add(userId);
          if (rms > maxVolume) {
            maxVolume = rms;
            currentActive = userId;
          }
        } else {
          speaking.delete(userId);
        }
      }

      setSpeakingUserIds(new Set(speaking));
      setActiveSpeakerId(currentActive);

      rafRef.current = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      for (const { source } of analyserMapRef.current.values()) {
        try {
          source.disconnect();
        } catch {
          // ignorar
        }
      }
      analyserMapRef.current.clear();
    };
  }, [localUserId, localStream, remoteStreams, threshold]);

  return { activeSpeakerId, speakingUserIds };
}
