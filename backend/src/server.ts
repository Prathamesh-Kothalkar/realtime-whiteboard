import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend origin
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on('draw', (data) => {
   // console.log(`🖌️ Drawing data received: ${JSON.stringify(data)}`);
    socket.broadcast.emit('draw', data);
  });

  socket.on('cursor', (data) => {
    console.log(`🖱️ Cursor data received: ${JSON.stringify(data)}`);
    socket.broadcast.emit('cursor', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
