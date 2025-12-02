// import { io, Socket } from 'socket.io-client';
// import {
//   PeerService,
//   Media
// } from '@connexify/webrtc-core';
// import type { constraints } from "@connexify/types";
// import type { connexifyConfig } from '@connexify/types';

// export class ConnexifyRTCClient {
//   private peers: Map<string, RTCPeerConnection>;
//   private media: Media;
//   public localMediaStream!: MediaStream | null;
//   public socket: Socket;
//   private configuration: constraints;

//   public remoteMediaStream!: Map<string, MediaStream>

//   public onRemoteStream?: (stream: MediaStream, peerId: string) => void;

//   constructor(params: connexifyConfig) {
//     this.peers = new Map();
//     this.media = new Media();
//     this.remoteMediaStream = new Map();

//     const signalingUrlStr = params.signalingURL.toString();
    
//     this.socket = io(signalingUrlStr, {
//       path: '/socket.io',
//       transports: ['websocket', 'polling'],
//       // Standard socket.io options to ensure cross-origin works
//       withCredentials: true 
//     });
//     this.configuration = params.constraints;
//   }

//   async start() {
//     this.localMediaStream = await this.media.initMedia(this.configuration);
//     console.log(this.localMediaStream?.getTracks());

//     if (!this.localMediaStream) alert("Local media is not working");

//     console.log("Please use .remoteMediaStream to get remote streams");
//   }

//   private createPeer(peerId: string) {

//     if (this.localMediaStream !== null) {
//       console.log("creating new peer");
//       const pc = new PeerService();
//       this.localMediaStream.getTracks().forEach(track => pc.peerConnection.addTrack(track, this.localMediaStream!));

//       pc.peerConnection.addEventListener("track", async ({ streams: [stream] }) => {
//         this.remoteMediaStream.set(peerId, stream);

//         console.log("📡 Track received:", peerId, stream);

//         if (this.onRemoteStream) {
//           this.onRemoteStream(stream, peerId);
//         }
//       });

//       pc.peerConnection.addEventListener("icecandidate", ({ candidate }) => {
//         if (candidate) {
//           this.socket.emit("ice-candidate", {
//             to: peerId,
//             from: this.socket.id,
//             candidate
//           });
//         }
//       })

//       return pc;
//     }
//     else alert("createPeer Failed");
//   }

//   socketHandler() {
//     this.socket.on("connect", () => {
//       console.log("🔌 Connected to signaling server:", this.socket.id);
//     });


//     this.socket.on("new-peer", async (peerId: string) => {
//       console.log('New peer:', peerId);

//       const pc = this.createPeer(peerId);

//       if (pc) {
//         if (!this.peers.has(peerId)) {
//           this.peers.set(peerId, pc.peerConnection);
//         }

//         const offer = await pc.peerConnection.createOffer();
//         await pc.peerConnection.setLocalDescription(offer);

//         this.socket.emit("offer", {
//           to: peerId,
//           from: this.socket.id,
//           sdp: offer
//         })
//       }
//     });

//     this.socket.on("offer", async ({ from, sdp }) => {
//       const pc = this.createPeer(from);

//       if (pc) {
//         if (!this.peers.has(from)) {
//           this.peers.set(from, pc.peerConnection);
//         }

//         await pc.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pc.peerConnection.createAnswer();
//         await pc.peerConnection.setLocalDescription(answer);

//         this.socket.emit("answer", {
//           to: from,
//           from: this.socket.id,
//           sdp: answer
//         });
//       }
//     });

//     this.socket.on("answer", async ({ from, sdp }) => {
//       await this.peers.get(from)?.setRemoteDescription(new RTCSessionDescription(sdp));
//     });

//     this.socket.on("ice-candidate", async ({ from, candidate }: { from: string,candidate: RTCIceCandidate }) => {
//       if (candidate) {
//         try {
//           await this.peers.get(from)?.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//         catch (e) {
//           alert("error at ice-candidates");
//           console.error('ICE error:', e);
//         }
//       }
//     });

//     this.socket.on("peer-disconnected", (peerId) => {
//       if (this.peers.has(peerId)) {
//         this.peers.get(peerId)?.close();

//         this.peers.delete(peerId);
//       }
//     });
//   }
// }



import { io, Socket } from 'socket.io-client';
import { PeerService, Media } from '@connexify/webrtc-core';
import type { constraints, connexifyConfig } from '@connexify/types';
import { EventEmitter } from 'events'; // 🟢 Required for client.on() support

export class ConnexifyRTCClient extends EventEmitter {
  private peers: Map<string, RTCPeerConnection>;
  private media: Media;
  public localMediaStream: MediaStream | null = null;
  public socket: Socket;
  private configuration: constraints;
  public remoteMediaStream: Map<string, MediaStream>;

  constructor(params: connexifyConfig) {
    super(); // 🟢 Init EventEmitter
    this.peers = new Map();
    this.media = new Media();
    this.remoteMediaStream = new Map();

    // 🟢 FIX: Use 'signalingUrl' (camelCase) and ensure it's a string
    this.socket = io(params.signalingURL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    
    this.configuration = params.constraints;
    this.socketHandler(); // 🟢 Initialize listeners immediately
  }

  async start() {
    this.localMediaStream = await this.media.initMedia(this.configuration);
    
    if (!this.localMediaStream) {
      console.error("Local media failed to initialize");
      return;
    }

    console.log("Local Stream Tracks:", this.localMediaStream.getTracks());
  }

  private createPeer(peerId: string) {
    if (!this.localMediaStream) {
      console.warn("Cannot create peer: No local stream");
      return;
    }

    console.log("Creating new peer connection for:", peerId);
    const pc = new PeerService();
    
    // Add local tracks to the connection
    this.localMediaStream.getTracks().forEach(track => {
      if (this.localMediaStream) {
        pc.peerConnection.addTrack(track, this.localMediaStream);
      }
    });

    // 🟢 Handle Remote Stream (Inbound)
    pc.peerConnection.addEventListener("track", ({ streams: [stream] }) => {
      this.remoteMediaStream.set(peerId, stream);
      console.log("📡 Track received from:", peerId);
      
      // 🟢 Event-Driven: Emit 'track' so the UI can react
      this.emit('track', stream, peerId); 
    });

    // Handle ICE Candidates (Outbound)
    pc.peerConnection.addEventListener("icecandidate", ({ candidate }) => {
      if (candidate) {
        this.socket.emit("ice-candidate", {
          to: peerId,
          from: this.socket.id,
          candidate
        });
      }
    });

    return pc;
  }

  private socketHandler() {
    this.socket.on("connect", () => {
      console.log("🔌 Connected to signaling server:", this.socket.id);
    });

    this.socket.on("new-peer", async (peerId: string) => {
      console.log('New peer joined:', peerId);
      const pc = this.createPeer(peerId);

      if (pc) {
        this.peers.set(peerId, pc.peerConnection);
        const offer = await pc.peerConnection.createOffer();
        await pc.peerConnection.setLocalDescription(offer);

        this.socket.emit("offer", {
          to: peerId,
          from: this.socket.id,
          sdp: offer
        });
      }
    });

    // 🟢 FIX: Explicit types for 'sdp' to satisfy Strict Mode
    this.socket.on("offer", async ({ from, sdp }: { from: string, sdp: RTCSessionDescriptionInit }) => {
      console.log("Received Offer from:", from);
      const pc = this.createPeer(from);

      if (pc) {
        this.peers.set(from, pc.peerConnection);
        await pc.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        
        const answer = await pc.peerConnection.createAnswer();
        await pc.peerConnection.setLocalDescription(answer);

        this.socket.emit("answer", {
          to: from,
          from: this.socket.id,
          sdp: answer
        });
      }
    });

    this.socket.on("answer", async ({ from, sdp }: { from: string, sdp: RTCSessionDescriptionInit }) => {
      console.log("Received Answer from:", from);
      await this.peers.get(from)?.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    this.socket.on("ice-candidate", async ({ from, candidate }: { from: string, candidate: RTCIceCandidateInit }) => {
      try {
        if (candidate) {
          await this.peers.get(from)?.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error('Error adding ICE candidate:', e);
      }
    });

    this.socket.on("peer-disconnected", (peerId: string) => {
      console.log("Peer disconnected:", peerId);
      if (this.peers.has(peerId)) {
        this.peers.get(peerId)?.close();
        this.peers.delete(peerId);
        // 🟢 Emit event so UI can remove the video element
        this.emit('peer-disconnected', peerId); 
      }
    });
  }
}