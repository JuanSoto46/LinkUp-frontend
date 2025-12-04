// src/components/VoiceChannel.tsx
import { useEffect, useRef } from "react";
import { useVoice } from "../lib/useVoice";

type VoiceChannelProps = {
  meetingId: string;
  userId: string;
};

export function VoiceChannel({ meetingId, userId }: VoiceChannelProps) {
  const { localStream, remoteStreams, isMicEnabled, toggleMic } = useVoice({
    meetingId,
    userId
  });

  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Attach local stream to <audio>
  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="voice-channel">
      <div className="voice-channel__controls">
        <button type="button" onClick={toggleMic}>
          {isMicEnabled ? "Silenciar micrófono" : "Activar micrófono"}
        </button>
      </div>

      {/* Local audio (muted to avoid echo) */}
      <audio ref={localAudioRef} autoPlay muted />

      {/* Remote audio streams */}
      <div className="voice-channel__remote-list">
        {remoteStreams.map(remote => (
          <RemoteAudio key={remote.userId} stream={remote.stream} />
        ))}
      </div>
    </div>
  );
}

type RemoteAudioProps = {
  stream: MediaStream;
};

function RemoteAudio({ stream }: RemoteAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay />;
}
