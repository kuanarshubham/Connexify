import React, { useEffect, useRef, useState } from 'react';
import { ConnexifyRTCClient } from '@connexify/core-sdk';


//crypto.randomUUID()

const client = new ConnexifyRTCClient(
  `peer-${Math.random()*1000000}`,
  'http://localhost:3000'
);

function App() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const handleJoin = async () => {
    const localStream = await client.startLocalStream();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    // Override remote stream handler
    client['onRemoteStream'] = (remoteStream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    client.joinRoom(roomId);
    setJoined(true);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Connexify WebRTC Demo</h2>

      {!joined && (
        <>
          <input
            value={roomId}
            placeholder="Enter Room ID"
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoin}>Join</button>
        </>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
        <div>
          <h4>Local Video</h4>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 300 }} />
        </div>
        <div>
          <h4>Remote Video</h4>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300 }} />
        </div>
      </div>
    </div>
  );
}

export default App;
