export const getLocalMedia = async (
  constraints: MediaStreamConstraints = { audio: true, video: true }
): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (err) {
    console.error("Failed to get user media:", err);
    throw err;
  }
};


export const toggleTrack = (stream: MediaStream, kind: 'audio' | 'video', enabled: boolean) => {
  const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
  tracks.forEach((track) => (track.enabled = enabled));
};


export const attachLocalTracks = (
  pc: RTCPeerConnection,
  stream: MediaStream
) => {
  for (const track of stream.getTracks()) {
    pc.addTrack(track, stream);
  }

  console.log("Attach local stream");
};


export const onRemoteTrack = (
  pc: RTCPeerConnection,
  handleStream: (stream: MediaStream) => void
) => {
  const remoteStream = new MediaStream();

  pc.ontrack = (event) => {
    remoteStream.addTrack(event.track);
    handleStream(remoteStream);
  };
};
