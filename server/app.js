import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import db from "./db/db.js";
import dotenv from "dotenv";
import userRoutes from './routes/userRoutes.js';
import chatRoomRoutes from './routes/chatRoomRoutes.js';
import postRoutes from './routes/postRoutes.js';
import setupSocket from './sockets/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

db();

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);
app.use('/chatroom', chatRoomRoutes);
app.use('/posts', postRoutes);

setupSocket(io);  // Setup socket events

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
