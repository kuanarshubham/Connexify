import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import 'dotenv/config'

// export const signallingServer = () => {
//   const PORT = process.env.PORT;

//   const app = express();
//   app.use(cors());

//   const httpServer = createServer(app);
//   const io = new Server(httpServer, { cors: { origin: '*' } });

//   const rooms = new Map<string, Set<string>>();
//   const peerMap = new Map<string, string>();

//   console.log("hello");

//   io.on('connection', socket => {
//     console.log(`[🟢 CONNECTED] ${socket.id}`);

//     socket.on('register-peer', ({ peerId }) => {
//       console.log("register-peer: ", peerId);
//       peerMap.set(socket.id, peerId);
//     });

//     socket.on('join-room', ({ roomId, peerId }) => {
//       console.log("join-room: ", roomId);
//       socket.join(roomId);
//       if (!rooms.has(roomId)) rooms.set(roomId, new Set());
//       rooms.get(roomId)!.add(socket.id);

//       console.log(`👥 ${socket.id} joined ${roomId} with total people in room: ${rooms.get(roomId)?.size}`);
//       //socket.to(roomId).emit('peer-joined', { socketId: socket.id, peerId });

//       socket.broadcast.to(roomId).emit("peer-joined", { socketId: socket.id, peerId });
//     });

//     socket.on('sending-offer', (data) => {
//       console.log("Sending offer")
//       socket.to(data.to).emit('getting-offer', data);
//     });

//     socket.on('sending-answer', (data) => {
//       console.log("Sending answer");
//       socket.to(data.to).emit('getting-answer', data);
//     });

//     socket.on('sending-ice-candidates-to-new-joinee', (data) => {
//       console.log("sending-ice-candidates-to-new-joinee");
//       socket.to(data.to).emit('reciving-ice-candidate-as-new-joinee', data);
//     });

//     socket.on("sending-ice-candidates-to-prev", (data) => {
//       console.log("sending-ice-candidates-to-prev");
//       socket.to(data.to).emit("reciving-ice-candidate-as-prev", data);
//     });

//     socket.on('disconnect', () => {
//       peerMap.delete(socket.id);
//       for (const [roomId, members] of rooms.entries()) {
//         members.delete(socket.id);
//         if (members.size === 0) rooms.delete(roomId);
//       }
//       console.log(`🔴 Disconnected: ${socket.id}`);
//     });
//   });

//   httpServer.listen(PORT, () => console.log(`🚀 Signaling server running on http://localhost:${PORT}`));
// }

export const signallingServer = () => {
  const PORT = process.env.PORT;

  const app = express();
  app.use(cors());

  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });

  let peers = new Map<string, Socket>();

  io.on("connection", socket => {
    console.log('New client:', socket.id);
    peers.set(socket.id, socket);


    socket.broadcast.emit("new-peer", socket.id);

    socket.on("offer", ({ to, from, sdp }) => {
      io.to(to).emit("offer", { from, sdp });
    });

    socket.on("answer", ({ to, from, sdp }) => {
      io.to(to).emit("answer", { from, sdp });
    })

    socket.on('ice-candidate', ({ to, from, candidate }) => {
      io.to(to).emit('ice-candidate', { from, candidate });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      peers.delete(socket.id);
      socket.broadcast.emit('peer-disconnected', socket.id);
    });
  });

  httpServer.listen(PORT, () => console.log(`Server x running at http://localhost:${PORT}`));
}