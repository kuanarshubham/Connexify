class PeerService {
    public peerConnection: RTCPeerConnection;
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

    constructor() {
        this.peerConnection = new RTCPeerConnection(this.config);
    }

}

export default PeerService;