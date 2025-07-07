// src/components/VideoPlayer.tsx
import React, { useRef, useEffect } from 'react';

interface Props {
  stream?: MediaStream;
  muted?: boolean;
}

export const VideoPlayer: React.FC<Props> = ({ stream, muted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted={muted} />;
};
