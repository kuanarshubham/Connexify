import { io, Socket } from 'socket.io-client';
import {
  PeerService,
  getLocalMedia,
  attachLocalTracks,
  onRemoteTrack,
} from '@connexify/webrtc-core';

export class ConnexifyRTCClient{
  private peerId: string;
  private socket: Socket;
  private pc: PeerService;

  public localStream!: MediaStream;
  // public remoteStream!: [MediaStream]
  
  private socketIdToUserId: Map<string, string>= new Map();
  private userIdToSocketId: Map<string, string>=new Map();

  constructor(
    peerId: string, 
    socketURL: string,
    constraints: MediaStreamConstraints
  ){
    this.peerId=peerId;
    this.socket=io(socketURL);
    this.signalingHandlers(constraints);
    this.pc = new PeerService();
  }

  async startLocalStream(constraints: MediaStreamConstraints = { audio: true, video: true }) {
    console.log("startLocalStream");
    this.localStream = await getLocalMedia(constraints);
    return this.localStream;
  }

  remoteStream(remoteVideo: HTMLVideoElement) {
  console.log("Registering remote stream handler...");

  const remoteMedia = new MediaStream();
  remoteVideo.srcObject = remoteMedia;

  this.pc.handleRemoteMedia((track) => {
    remoteMedia.addTrack(track); // remote stream tracks get added here later
    console.log("Track added to remote video:", track.kind);
  });
}



  joinRoom(roomId: string) {
    this.socket.emit('register-peer', { peerId: this.peerId });
    this.socket.emit('join-room', { roomId, peerId: this.peerId });
  }

  // leaveRoom() {
  //   this.peerConnections.forEach(pc => pc.close());
  //   this.peerConnections.clear();
  //   this.socket.disconnect();
  // }

  async signalingHandlers(constraints: MediaStreamConstraints){
    const localMedia = await getLocalMedia(constraints);

    localMedia.getTracks().forEach(track => {
      this.pc.handleMedia(track, localMedia);
    });

    const iceCandidate = await this.pc.sendIceCandidates();

    this.socket.on("peer-joined", async ({socketId, peerId}) => {
      console.log("Peer-joined");
      if(socketId===this.socket.id) return;

      this.socketIdToUserId.set(socketId, peerId);
      this.userIdToSocketId.set(peerId, socketId);

      const offer = await this.pc.generateOffer();

      this.socket.emit("sending-offer", {offer, to:socketId, from:this.socket.id, peerId:this.peerId});
    });

    this.socket.on("getting-offer", async({offer, to, from, peerId}) => {
      console.log("Getting-offer");
      this.socketIdToUserId.set(from, peerId);
      this.userIdToSocketId.set(peerId, from);

      console.log("Offer gotten from other tab: ", offer);

      const ans = await this.pc.generateAnswer(offer);
      console.log("genettating answer: ", ans);
      
      this.socket.emit("sending-answer", {ans, to:from, from:to, peerId:this.peerId});
    });

    this.socket.on("getting-answer", async({ans, to, from, peerId}) => {
      console.log("Getting-answer")
      await this.pc.setLocalDescription(ans);

      this.socket.emit("sending-ice-candidates-to-new-joinee", {iceCandidate, to:from, from:to, peerId});
    });

    this.socket.on("reciving-ice-candidate-as-new-joinee", async ({iceCandidate, from, to, peerId}) => {
      console.log("reciving-ice-candidate-as-new-joinee");
      await this.pc.addIceCandidates(iceCandidate, peerId);

      this.socket.emit("sending-ice-candidates-to-prev", {iceCandidate, to:from, from:to, peerId});
    });

    this.socket.on("reciving-ice-candidate-as-prev", async ({iceCandidate, to, from, peerId}) => {
      console.log("reciving-ice-candidate-as-prev");
      await this.pc.addIceCandidates(iceCandidate, peerId);

      console.log("signalling-done");
      //this.socket.close();
    });
  }
}












// class ConnexifyRTCClient2 {
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