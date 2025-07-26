const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let peers = {};

io.on('connection', (socket) => {
  console.log('New client:', socket.id);
  peers[socket.id] = socket;

  // Notify new peer to existing peers
  socket.broadcast.emit('new-peer', socket.id);

  // Relay offer, answer, and ICE
  socket.on('offer', ({ to, from, sdp }) => {
    io.to(to).emit('offer', { from, sdp });
  });

  socket.on('answer', ({ to, from, sdp }) => {
    io.to(to).emit('answer', { from, sdp });
  });

  socket.on('ice-candidate', ({ to, from, candidate }) => {
    io.to(to).emit('ice-candidate', { from, candidate });
  });

  // Clean up
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete peers[socket.id];
    socket.broadcast.emit('peer-disconnected', socket.id);
  });
});

server.listen(3000, () => console.log('Server running at http://localhost:3000'));
