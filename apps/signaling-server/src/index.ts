import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config'

const PORT = process.env.PORT;

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const rooms = new Map<string, Set<string>>();  
const peerMap = new Map<string, string>();     

io.on('connection', socket => {
  console.log(`[🟢 CONNECTED] ${socket.id}`);

  socket.on('register-peer', ({ peerId }) => {
    console.log("register-peer: ", peerId);
    peerMap.set(socket.id, peerId);
  });

  socket.on('join-room', ({ roomId, peerId }) => {
    console.log("join-room: ", roomId);
    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId)!.add(socket.id);

    console.log(`👥 ${socket.id} joined ${roomId} with total people in room: ${rooms.get(roomId)?.size}`);
    socket.to(roomId).emit('peer-joined', { socketId: socket.id, peerId });
  });

  socket.on('offer', (data) => {
    console.log("Creating offer");
    io.to(data.to).emit('offer', data);
  });

  socket.on('answer', (data) => {
    console.log("Reciving answer");
    io.to(data.to).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    console.log("Got Ice-cands");
    io.to(data.to).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    peerMap.delete(socket.id);
    for (const [roomId, members] of rooms.entries()) {
      members.delete(socket.id);
      if (members.size === 0) rooms.delete(roomId);
    }
    console.log(`🔴 Disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => console.log(`🚀 Signaling server running on http://localhost:${PORT}`));
