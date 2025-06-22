# Connexify

**Connexify** is a plug-and-play JavaScript/TypeScript SDK and web service designed to simplify building WebRTC-based real-time communication apps. It abstracts away the complex signaling, media transport, and infrastructure challenges, letting developers easily switch between peer-to-peer (P2P) and selective forwarding unit (SFU) modes — without drowning in WebRTC internals.

---

## Why Connexify?

WebRTC is powerful but notoriously tricky to set up. Developers often struggle with:

- Handling signaling protocols and connection lifecycles  
- Managing ICE, STUN, TURN, and SDP details  
- Building and maintaining scalable SFU infrastructure  

Connexify solves these pain points by offering a clean SDK and signaling backend that take care of the heavy lifting, so you can focus on building great user experiences instead of plumbing.

---

## Features

- **Simple SDK API** in TypeScript for browser-based apps  
- Choose between connection modes:
  - `p2p` — direct 1:1 peer-to-peer calls  
  - `sfu` — multi-user calls via MediaSoup SFU  
  - `adaptive` (planned) — automatic mode switching based on call size  
- Robust signaling server powered by Socket.IO  
- Example React frontend to test and demonstrate features  
- Modular, extensible architecture ready for plugin integrations  
- Designed with scalability and production-readiness in mind  

---

## Technology Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Language     | TypeScript                    |
| Signaling    | Socket.IO (WebSocket-based)  |
| Media (P2P)  | Native WebRTC APIs            |
| Media (SFU)  | MediaSoup (Node.js)           |
| Backend      | Node.js + Express             |
| Frontend     | React + ShadCN (example UI)  |
| Packaging    | Turborepo + PNPM workspaces   |
| DevOps       | Docker (planned), CI/CD       |

---

## Getting Started

### Installation

```bash
npm install connexify
# or
yarn add connexify
