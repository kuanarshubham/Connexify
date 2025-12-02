import type {constraints} from "@connexify/types" 

class Media {
  public localStream: MediaStream | null;

  constructor(){
    this.localStream = null;
  }

  async initMedia(conf: constraints) {
    try {

      const stream = await navigator.mediaDevices.getUserMedia(conf);
      this.localStream = stream;
      return stream;

    } catch (err) {
      console.error('Media error:', err);
      return null;
    }
  }
}

export default Media;