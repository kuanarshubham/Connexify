import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import 'dotenv/config'

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

  httpServer.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
}