import { io, Socket } from 'socket.io-client';
import {
  PeerService,
  getLocalMedia,
  attachLocalTracks,
  onRemoteTrack,
} from '@connexify/webrtc-core';

export class ConnexifyRTCClient{
  private peerId: string;
  private socketURL: string;
  public localStream!: MediaStream;
  

  constructor(
    peerId: string, 
    socketURL: string,
    constraints: MediaStreamConstraints
  ){
    this.peerId=peerId;
    this.socketURL=socketURL;
    this.signalingHandlers(constraints);
  }

  async startLocalStream(constraints: MediaStreamConstraints = { audio: true, video: true }) {
    console.log("startLocalStream");
    this.localStream = await getLocalMedia(constraints);
    return this.localStream;
  }

  private async signalingHandlers(constraints: MediaStreamConstraints){
    const pc = new PeerService();
    const localMedia = await getLocalMedia(constraints);

    localMedia.getTracks().forEach(track => {
      pc.handleMedia(track, localMedia);
    });

    const offer = await pc.generateOffer();
    
  }
}












// export class ConnexifyRTCClient {
//   private socket: Socket;
//   private peerId: string;
//   private peerConnections = new Map<string, RTCPeerConnection>();
//   private localStream?: MediaStream;
//   public onRemoteStream?: (remoteStream: MediaStream) => void;

//   constructor(peerId: string, signalingURL: string) {
//     this.peerId = peerId;
//     this.socket = io("http://localhost:3000");
//     this.registerSignalingHandlers();
//   }

//   async startLocalStream(constraints: MediaStreamConstraints = { audio: true, video: true }) {
//     console.log("startLocalStream");
//     this.localStream = await getLocalMedia(constraints);
//     return this.localStream;
//   }

//   joinRoom(roomId: string) {
//     this.socket.emit('register-peer', { peerId: this.peerId });
//     this.socket.emit('join-room', { roomId, peerId: this.peerId });
//   }

//   leaveRoom() {
//     this.peerConnections.forEach(pc => pc.close());
//     this.peerConnections.clear();
//     this.socket.disconnect();
//   }

//   private createPeer(remotePeerId: string): RTCPeerConnection {
//     const pc = createPeerConnection();

//     if (!this.localStream) {
//       console.warn("⚠️ No local stream available when creating peer!");
//     } else {
//       attachLocalTracks(pc, this.localStream); // 🧠 Attach before offer/answer
//     }

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         this.socket.emit('ice-candidate', {
//           to: remotePeerId,
//           from: this.peerId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     onRemoteTrack(pc, (remoteStream) => {
//       console.log(`🔗 Remote stream received from ${remotePeerId}`);
//       this.onRemoteStream?.(remoteStream); // 🧠 Trigger remote video
//     });

//     this.peerConnections.set(remotePeerId, pc);
//     return pc;
//   }


//   private registerSignalingHandlers() {
//     // When another peer joins the room
//     this.socket.on('peer-joined', async ({ socketId }) => {
//       // 🔁 Skip self
//       if (socketId === this.socket.id) return;

//       const pc = this.createPeer(socketId);

//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);

//       this.socket.emit('offer', {
//         to: socketId,
//         from: this.peerId,
//         offer,
//       });
//     });


//     // When receiving an offer
//     this.socket.on('offer', async ({ from, offer }) => {
//       console.log("📨 Received offer");

//       // 🧠 Ensure local stream exists
//       if (!this.localStream) {
//         console.warn("❗ No local stream while handling offer");
//         this.localStream = await getLocalMedia(); // fallback (ideally handled in frontend)
//       }

//       const pc = this.createPeer(from);
//       await pc.setRemoteDescription(offer);

//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);

//       this.socket.emit('answer', {
//         to: from,
//         from: this.peerId,
//         answer,
//       });
//     });


//     // When receiving an answer
//     this.socket.on('answer', async ({ from, answer }) => {
//       console.log("Createing answer")
//       const pc = this.peerConnections.get(from);
//       if (!pc) return console.warn(`⚠️ No peer connection for ${from}`);
//       await pc.setRemoteDescription(answer);
//     });

//     // When receiving ICE candidate
//     this.socket.on('ice-candidate', async ({ from, candidate }) => {
//       const pc = this.peerConnections.get(from);
//       if (!pc) return console.warn(`⚠️ No peer connection for ${from}`);
//       await pc.addIceCandidate(candidate);
//     });
//   }
// }