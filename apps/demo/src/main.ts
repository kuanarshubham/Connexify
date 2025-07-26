// // main.ts
// import './style.css';
// import { ConnexifyRTCClient } from '@connexify/core-sdk';

// const app = document.querySelector<HTMLDivElement>('#app')!;

// app.innerHTML = `
//   <div class="container">
//     <h2>📡 Connexify WebRTC Demo</h2>
//     <div class="controls">
//       <input id="roomInput" type="text" placeholder="Enter Room ID" />
//       <button id="joinBtn">Join</button>
//     </div>
//     <div class="videos">
//       <div>
//         <h4>🎤 Local Video</h4>
//         <video id="localVideo" autoplay muted playsinline></video>
//       </div>
//       <div>
//         <h4>🎥 Remote Video</h4>
//         <div id="remoteVideos"></div> 
//       </div>
//     </div>
//   </div>
// `;

// const roomInput = document.getElementById('roomInput') as HTMLInputElement;
// const joinBtn = document.getElementById('joinBtn') as HTMLButtonElement;
// const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
// const remoteVideos = document.getElementById('remoteVideos') as HTMLDivElement;


// async function connexifySetUp(){
//   const conn = new ConnexifyRTCClient({
//     signalingURL: new URL("https://shubham.loca.lt"),
//     constraints:{
//       audio: true,
//       video:  true
//     }
//   });

//   await conn.start();
//   localVideo.srcObject = conn.localMediaStream;

//   console.log("Local setup complete");

//   conn.socketHandler();
// }

// connexifySetUp();


import './style.css';
import { ConnexifyRTCClient } from '@connexify/core-sdk';

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
        <h4>🎥 Remote Video(s)</h4>
        <div id="remoteVideos" class="remote-container"></div> 
      </div>
    </div>
  </div>
`;

const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const remoteVideos = document.getElementById('remoteVideos') as HTMLDivElement;

async function connexifySetUp() {
  const conn = new ConnexifyRTCClient({
    signalingURL: new URL("https://shubham.loca.lt"),
    constraints: {
      audio: true,
      video: true
    }
  });

  // Setup incoming stream handler BEFORE start
  conn.onRemoteStream = (remoteStream: MediaStream, peerId: string) => {
    console.log("🎥 Remote stream received from peer:", peerId);

    // Check if video already exists for this peer
    if (document.getElementById(`video-${peerId}`)) return;

    const video = document.createElement("video");
    video.id = `video-${peerId}`;
    video.srcObject = remoteStream;
    video.autoplay = true;
    video.playsInline = true;
    video.className = "remote-video";
    remoteVideos.appendChild(video);
  };

  conn.socketHandler();

  conn.socket.on("connect", async () => {
    await conn.start(); // THEN start

    // Set local stream after successful start
    if (conn.localMediaStream) {
      localVideo.srcObject = conn.localMediaStream;
    }

    console.log("✅ Local stream set");
  });
}

connexifySetUp();
