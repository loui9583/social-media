import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js' 
import chatRoomModel from '../db/models/chatRoomModel.js';

import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

router.get("/:roomname", authenticateToken, async (req, res) => {
    const { roomname } = req.params;
    
    try {
      const chatRoom = await chatRoomModel.findOne({roomName: roomname})
  
      if (!chatRoom) {
        return res.status(404).send('Chatroom not found.'); // Handle case where chatRoom is not found
      }
  
      // Assuming roomName stores usernames separated by '-'
      let chatRoomUsernames = chatRoom.roomName.split('-');
      const { username } = req.user;
      let isUserAllowed = chatRoomUsernames.includes(username);
  
      if (isUserAllowed) {
        res.json(chatRoom); // Send the entire chatRoom object including messages if the user is allowed
      } else {
        res.status(403).send('Access Denied: You do not have permission to enter this chatroom.');
      }
    } catch (error) {
      res.status(500).send('Server error: ' + error.message);
    }
  });
  
  
  router.post("/:roomname", authenticateToken, async (req, res) => {
    const { roomname } = req.params;
    const { username } = req.user;
    const { message } = req.body;
  
    try {
      // Find the chatroom document by ID
      const chatRoom = await chatRoomModel.findOne({roomName: roomname})
  
      // Assuming roomName stores usernames separated by '-'
      let chatRoomUsernames = roomname.split('-');
      let isUserAllowed = chatRoomUsernames.includes(username);
  
      if (isUserAllowed) {
        // Push the new message object into the messages array
        chatRoom.messages.push({ message: message, username: username });
        await chatRoom.save(); // Save the updated chatroom document
        res.send('Message added successfully.');
      } else {
        res.status(403).send('Access Denied: You do not have permission to enter this chatroom.');
      }
    } catch (error) {
      // Handle any errors that occur during the operation
      res.status(500).send('Server error: ' + error.message);
    }
  });
  
  export default router;