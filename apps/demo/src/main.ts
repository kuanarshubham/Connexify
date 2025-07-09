// main.ts
import './style.css';
import { ConnexifyRTCClient } from '@connexify/core-sdk';

const peerId = `peer-${crypto.randomUUID()}`;
const client = new ConnexifyRTCClient(peerId, 'http://localhost:3000', {
  audio: true,
  video: true
});

console.log(client);

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="container">
    <h2>📡 Connexify WebRTC Demo</h2>
    <div class="controls">
      <input id="roomInput" type="text" placeholder="Enter Room ID" />
      <button id="joinBtn">Join</button>
    </div>
    <div class="videos">
      <div>
        <h4>🎤 Local Video</h4>
        <video id="localVideo" autoplay muted playsinline></video>
      </div>
      <div>
        <h4>🎥 Remote Video</h4>
        <video id="remoteVideo" autoplay playsinline></video>
      </div>
    </div>
  </div>
`;

const roomInput = document.getElementById('roomInput') as HTMLInputElement;
const joinBtn = document.getElementById('joinBtn') as HTMLButtonElement;
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
