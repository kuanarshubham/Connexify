export class PeerService {
  private config: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      },
    ],
  }
  private peer: RTCPeerConnection;

  public peerConnections = new Map<string, RTCPeerConnection>();

  constructor() {
    this.peer = new RTCPeerConnection(this.config);
  }

  async generateAnswer(offer: RTCSessionDescriptionInit) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans: RTCSessionDescriptionInit) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async generateOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  async sendIceCandidates(){
    this.peer.onicecandidate = ({candidate}) => {
      
      if(candidate){
        console.log(candidate, " at send");
        return candidate;
      }
    }
  }

  // async addIceCandidates(candidates: RTCIceCandidate, peerId: string){
  //   console.log(candidates);
  //   if(candidates){
  //     if(!this.peerConnections.has(peerId)) this.peerConnections.set(peerId, new RTCPeerConnection(this.config));

  //     const newPeer = this.peerConnections.get(peerId);
  //     console.log("New Peer: ",newPeer); 
  //     await newPeer!.addIceCandidate(candidates);

  //     // newPeer!.ontrack = ({streams}) => {
  //     //   const [newStream] = streams;
  //     //   console.log(newStream);
  //     // }
  //   }
  // }

  async addIceCandidates(candidates: RTCIceCandidate, peerId: string) {
  if (candidates) {
    await this.peer.addIceCandidate(candidates);
  }
}


  // handleRemoteMedia(){
  //   let allPeerTracks = [];

  //   this.peerConnections.forEach(pc => {
  //     pc.ontrack = ({streams}) => {
  //       const [newStream] = streams;
  //       allPeerTracks.push(newStream)
  //     }
  //   });

  //   return allPeerTracks;
  // }

  handleRemoteMedia(callback: (track: MediaStreamTrack) => void) {
  this.peer.ontrack = ({ track }) => {
    console.log("🎥 Remote track received:", track);
    callback(track);
  };
}


  handleMedia(track: MediaStreamTrack, localStream: MediaStream){
    return this.peer.addTrack(track, localStream);
  }
}