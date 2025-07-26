const socket = io();

const localVideo = document.getElementById('localVideo');
const remoteVideos = document.getElementById('remoteVideos');

let localStream;
const peers = {}; // key: socketId, value: RTCPeerConnection

// Get local media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localVideo.srcObject = stream;
    localStream = stream;
  })
  .catch(err => console.error('Media error:', err));

// Signaling handlers
socket.on('new-peer', async (peerId) => {
  console.log('New peer:', peerId);
  const pc = createPeer(peerId);
  peers[peerId] = pc;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit('offer', { to: peerId, from: socket.id, sdp: offer });
});

socket.on('offer', async ({ from, sdp }) => {
  const pc = createPeer(from);
  peers[from] = pc;

  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit('answer', { to: from, from: socket.id, sdp: answer });
});

socket.on('answer', async ({ from, sdp }) => {
  await peers[from].setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on('ice-candidate', async ({ from, candidate }) => {
  if (candidate) {
    try {
      await peers[from].addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('ICE error:', e);
    }
  }
});

socket.on('peer-disconnected', (peerId) => {
  if (peers[peerId]) {
    peers[peerId].close();
    delete peers[peerId];
    const video = document.getElementById(peerId);
    if (video) video.remove();
  }
});

function createPeer(peerId) {
  const pc = new RTCPeerConnection();

  // Add local stream tracks
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // Handle remote stream
  pc.ontrack = ({ streams: [stream] }) => {
    let video = document.getElementById(peerId);
    if (!video) {
      video = document.createElement('video');
      video.id = peerId;
      video.autoplay = true;
      remoteVideos.appendChild(video);
    }
    video.srcObject = stream;
  };

  // Send ICE candidates
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit('ice-candidate', { to: peerId, from: socket.id, candidate });
    }
  };

  return pc;
}
