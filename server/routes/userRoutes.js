import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../db/models/userModel.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { sendLoginMail, sendForgotPasswordEmail } from "../nodemail/nodemail.js";
import connectedUsers from '../globalvariables/globalVariables.js';
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;



const router = express.Router();

router.get('/isconnected/:username', async (req, res) => {
    const { username } = req.params;
    let result = false;
    for (let user of connectedUsers) {
        if (user.username === username) result = true;
    }
    res.json({ isConnected: result });
})


router.post('/addfriend', authenticateToken, async (req, res) => {
    const { username } = req.user;
    try {
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const friendUser = await UserModel.findOne({ username: req.body.friendUsername });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        friendUser.friends.push(username);
        await friendUser.save()


        user.friends.push(req.body.friendUsername);
        await user.save();
        res.status(201).send();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding note");
    }
});

router.get("/", authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            Username: user.username,
            id: user._id,
            friends: user.friends
        });
    } catch (error) {
        console.error(error);
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET);
        sendLoginMail(user.email, user.username);
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error logging in");
    }
});

router.post('/signup', async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new UserModel({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
        });
        await user.save();
        res.status(201).send();
    } catch (error) {
        console.error(error); c
        res.status(500).send("Error creating user");
    }
});

router.post('/changepassword', authenticateToken, async (req, res) => {
    const { username } = req.user;
    try {
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(201).send();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error changing password");
    }
})

router.post("/forgotpassword", async (req, res) => {
    const { username } = req.body;
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {

            return res.status(200).json({ message: "Reset email sent. Check your inbox (and spam folder)." });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' }); // Token expires in 1 hour
        sendForgotPasswordEmail(user.email, user.username, token);

        res.status(200).json({ message: "Reset email sent. Check your inbox (and spam folder)." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred. Please try again later." });
    }
})

router.get("/exists/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const user = await UserModel.findOne({ username: username });
        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error checking user existence");
    }
});


export default router;