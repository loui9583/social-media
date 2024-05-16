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
        const chatRoom = await chatRoomModel.findOne({ roomName: roomname })

        if (!chatRoom) {
            return res.status(404).send('Chatroom not found.');
        }


        let chatRoomUsernames = chatRoom.roomName.split('-');
        const { username } = req.user;
        let isUserAllowed = chatRoomUsernames.includes(username);

        if (isUserAllowed) {
            res.json(chatRoom);
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
        const chatRoom = await chatRoomModel.findOne({ roomName: roomname })


        let chatRoomUsernames = roomname.split('-');
        let isUserAllowed = chatRoomUsernames.includes(username);

        if (isUserAllowed) {

            chatRoom.messages.push({ message: message, username: username });
            await chatRoom.save();
            res.send('Message added successfully.');
        } else {
            res.status(403).send('Access Denied: You do not have permission to enter this chatroom.');
        }
    } catch (error) {

        res.status(500).send('Server error: ' + error.message);
    }
});

export default router;