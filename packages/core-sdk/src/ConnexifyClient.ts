import { io, Socket } from 'socket.io-client';
import {
  createPeerConnection,
  getLocalMedia,
  attachLocalTracks,
  onRemoteTrack,
} from '@connexify/webrtc-core';

export class ConnexifyRTCClient {
  private socket: Socket;
  private peerId: string;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private localStream?: MediaStream;

  constructor(peerId: string, signalingURL: string) {
    this.peerId = peerId;
    this.socket = io("http://loacalhost:3001");
    this.registerSignalingHandlers();
  }

  async startLocalStream(constraints: MediaStreamConstraints = { audio: true, video: true }) {
    this.localStream = await getLocalMedia(constraints);
    return this.localStream;
  }

  joinRoom(roomId: string) {
    this.socket.emit('register-peer', { peerId: this.peerId });
    this.socket.emit('join-room', { roomId, peerId: this.peerId });
  }

  leaveRoom() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.socket.disconnect();
  }

  private createPeer(remotePeerId: string): RTCPeerConnection {
    const pc = createPeerConnection();

    // Attach local tracks (if already available)
    if (this.localStream) {
      attachLocalTracks(pc, this.localStream);
    }

    // Emit ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          to: remotePeerId,
          from: this.peerId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote track event
    onRemoteTrack(pc, (remoteStream) => {
      // You can emit a custom event here if needed
      console.log(`🔗 Remote stream received from ${remotePeerId}`, remoteStream);
    });

    this.peerConnections.set(remotePeerId, pc);
    return pc;
  }

  private registerSignalingHandlers() {
    // When another peer joins the room
    this.socket.on('peer-joined', async ({ socketId }) => {
      const pc = this.createPeer(socketId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket.emit('offer', {
        to: socketId,
        from: this.peerId,
        offer,
      });
    });

    // When receiving an offer
    this.socket.on('offer', async ({ from, offer }) => {
      const pc = this.createPeer(from);
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket.emit('answer', {
        to: from,
        from: this.peerId,
        answer,
      });
    });

    // When receiving an answer
    this.socket.on('answer', async ({ from, answer }) => {
      const pc = this.peerConnections.get(from);
      if (!pc) return console.warn(`⚠️ No peer connection for ${from}`);
      await pc.setRemoteDescription(answer);
    });

    // When receiving ICE candidate
    this.socket.on('ice-candidate', async ({ from, candidate }) => {
      const pc = this.peerConnections.get(from);
      if (!pc) return console.warn(`⚠️ No peer connection for ${from}`);
      await pc.addIceCandidate(candidate);
    });
  }
}
