import jwt from 'jsonwebtoken';
import chatRoomModel from '../db/models/chatRoomModel.js';
import connectedUsers from '../globalvariables/globalVariables.js';
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    const token = socket.handshake.auth.token;

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        socket.disconnect();
      } else {
        socket.user = user;
        connectedUsers.push(user);
        console.log('Connected users: ');
        console.log(connectedUsers);
        console.log('User authenticated:', user.username);

        socket.on('join room', async (roomUsername) => {
          const username = socket.user.username;
          const room = [roomUsername].sort().join('-');
          socket.join(room);
          console.log(`User joined room: ${room}`);
          const c = await chatRoomModel.findOne({ roomName: room });
          if (!c) {
            const newChatRoom = new chatRoomModel({
              roomName: room,
              messages: []
            });
            await newChatRoom.save();
            console.log(`New room created: ${room}`);
          }
        });

        socket.on('chat message', ({ room, message }) => {
          console.log(`${user.username} in room ${room}: ${message}`);
          io.to(room).emit('chat message', { message: message, username: user.username });
        });

        socket.on('disconnect', () => {
          console.log(`${socket.user.username} disconnected`);
          const index = connectedUsers.indexOf(socket.user);
          if (index > -1) {
            connectedUsers.splice(index, 1);
          }
          console.log('Updated list of connected users:', connectedUsers);
        });
      }
    });
  });
}

export default setupSocket;
