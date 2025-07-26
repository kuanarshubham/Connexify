import { constraints } from "./webrtc-core.js";

export interface connexifyConfig{
    signalingURL: URL,
    constraints: constraints
}