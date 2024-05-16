import mongoose from 'mongoose';

import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


const chatRoomSchema = new mongoose.Schema({
    roomName: String,
    createdAt: { type: Date, default: Date.now },
    messages: [{message: String, username: String}]
  });
  
  const chatRoomModel = mongoose.model("chatRoom", chatRoomSchema);
  
  export default chatRoomModel;