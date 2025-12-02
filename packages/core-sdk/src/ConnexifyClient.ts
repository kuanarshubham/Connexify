import { io, Socket } from 'socket.io-client';
import {
  PeerService,
  Media
} from '@connexify/webrtc-core';
import type { constraints } from "@connexify/types";
import type { connexifyConfig } from '@connexify/types';

export class ConnexifyRTCClient {
  private peers: Map<string, RTCPeerConnection>;
  private media: Media;
  public localMediaStream!: MediaStream | null;
  public socket: Socket;
  private configuration: constraints;

  public remoteMediaStream!: Map<string, MediaStream>

  public onRemoteStream?: (stream: MediaStream, peerId: string) => void;

  constructor(params: connexifyConfig) {
    this.peers = new Map();
    this.media = new Media();
    this.remoteMediaStream = new Map();

    const signalingUrlStr = params.signalingURL.toString();
    
    this.socket = io(signalingUrlStr, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      // Standard socket.io options to ensure cross-origin works
      withCredentials: true 
    });
    this.configuration = params.constraints;
  }

  async start() {
    this.localMediaStream = await this.media.initMedia(this.configuration);
    console.log(this.localMediaStream?.getTracks());

    if (!this.localMediaStream) alert("Local media is not working");

    console.log("Please use .remoteMediaStream to get remote streams");
  }

  private createPeer(peerId: string) {

    if (this.localMediaStream !== null) {
      console.log("creating new peer");
      const pc = new PeerService();
      this.localMediaStream.getTracks().forEach(track => pc.peerConnection.addTrack(track, this.localMediaStream!));

      pc.peerConnection.addEventListener("track", async (event: RTCTrackEvent) => {
        const [stream] = event.streams;
        this.remoteMediaStream.set(peerId, stream);

        console.log("📡 Track received:", peerId, stream);

        if (this.onRemoteStream) {
          this.onRemoteStream(stream, peerId);
        }
      });

      pc.peerConnection.addEventListener("icecandidate", ({ candidate }: RTCPeerConnectionIceEvent) => {
        if (candidate) {
          this.socket.emit("ice-candidate", {
            to: peerId,
            from: this.socket.id,
            candidate
          });
        }
      })

      return pc;
    }
    else alert("createPeer Failed");
  }

  socketHandler() {
    this.socket.on("connect", () => {
      console.log("🔌 Connected to signaling server:", this.socket.id);
    });


    this.socket.on("new-peer", async (peerId: string) => {
      console.log('New peer:', peerId);

      const pc = this.createPeer(peerId);

      if (pc) {
        if (!this.peers.has(peerId)) {
          this.peers.set(peerId, pc.peerConnection);
        }

        const offer = await pc.peerConnection.createOffer();
        await pc.peerConnection.setLocalDescription(offer);

        this.socket.emit("offer", {
          to: peerId,
          from: this.socket.id,
          sdp: offer
        })
      }
    });

    this.socket.on("offer", async ({ from, sdp }) => {
      const pc = this.createPeer(from);

      if (pc) {
        if (!this.peers.has(from)) {
          this.peers.set(from, pc.peerConnection);
        }

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

    this.socket.on("answer", async ({ from, sdp }) => {
      await this.peers.get(from)?.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    this.socket.on("ice-candidate", async ({ from, candidate }: { from: string,candidate: RTCIceCandidate }) => {
      if (candidate) {
        try {
          await this.peers.get(from)?.addIceCandidate(new RTCIceCandidate(candidate));
        }
        catch (e) {
          alert("error at ice-candidates");
          console.error('ICE error:', e);
        }
      }
    });

    this.socket.on("peer-disconnected", (peerId) => {
      if (this.peers.has(peerId)) {
        this.peers.get(peerId)?.close();

        this.peers.delete(peerId);
      }
    });
  }
}