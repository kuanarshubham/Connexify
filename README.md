# Connexify

**Connexify** is a developer-focused SDK and signaling service that simplifies setting up WebRTC-based real-time video calls using peer-to-peer (P2P) mesh architecture. Built with TypeScript, Socket.IO, and native WebRTC APIs, it abstracts away the signaling, SDP exchange, and ICE negotiation complexities — letting developers integrate real-time video functionality with minimal setup.

---

## 🚀 What It Does (So Far)

- Enables **1:1 video calls** using WebRTC in the browser
- Provides a **modular TypeScript SDK** to initiate, manage, and tear down connections
- Uses a **Socket.IO-based signaling server** for offer/answer and ICE candidate exchange
- Demonstrates a clean developer experience with a basic UI for testing

---

## 🧱 Tech Stack

- **WebRTC** (P2P media exchange)
- **Socket.IO** (Signaling over WebSockets)
- **TypeScript** (shared across SDK and backend)
- **Node.js + Express** (Signaling server)
- **Turborepo + PNPM** (Monorepo structure)
- **React + ShadCN (optional UI)** for test interface

---

## 💡 Why This Project?

Setting up even basic WebRTC requires understanding multiple moving parts:
- Signaling flows (offer/answer, ICE candidates)
- Connection lifecycle management
- Media stream handling in the browser

**Connexify** wraps all of this in a simple SDK and gives developers a running start. It’s designed for extensibility — future support for SFU (MediaSoup) and plugin hooks is planned — but the current implementation focuses on solid P2P foundations.

---

## 📦 Example Usage (SDK Preview)

```ts
import { Connexify } from 'connexify';

const conn = new Connexify({
  mode: 'p2p',
  media: ['audio', 'video'],
  signalingURL: 'wss://your-signaling-server.com',
});

await conn.init();
await conn.join('room-123');

// Optional controls
conn.toggleMic();
conn.endCall();
