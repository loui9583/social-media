import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from "mongoose";
import db from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendLoginMail, sendForgotPasswordEmail } from "./nodemail.js";
import dotenv from "dotenv"; 

dotenv.config();

const app = express();
const server = http.createServer(app);

db();

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    email: String,
    friends: [String]
});

const UserModel = mongoose.model("users", userSchema);

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

  io.on('connection', (socket) => {
    console.log('A user connected');

    const token = socket.handshake.auth.token;

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        // Handle token verification error
        console.error('Token verification failed:', err.message);
        socket.disconnect();
      } else {
        // Token is valid, proceed with the connection
        socket.user = user;
        console.log('User authenticated:', user.username);

        // Join room event
        socket.on('join room', (roomUsername) => {
          const username = socket.user.username;
          const room = [roomUsername].sort().join('-');
          socket.join(room);
          console.log(`User joined room: ${room}`);
        });

        // Handle chat messages within the room
        socket.on('chat message', ({ room, message }) => {
          console.log(`${user.username} in room ${room}: ${message}`);
          // Broadcast to all clients in the room
          io.to(room).emit('chat message', {message: message, username: user.username});
        });

        // Disconnect event
        socket.on('disconnect', () => {
          console.log('A user disconnected');
        });
      }
    });
  });


// ###### 

app.post("/users/login", async (req, res) => {
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

app.post('/users/signup', async (req, res) => {
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
      console.error(error);
      res.status(500).send("Error creating user");
  }
});

app.post('/users/changepassword', authenticateToken, async (req, res) => {
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

app.post("/users/forgotpassword", async (req, res) => {
  const { username } = req.body;
  try {
      const user = await UserModel.findOne({ username });
      if (!user) {
          // Informing the user that an email has been sent
          return res.status(200).json({ message: "Reset email sent. Check your inbox (and spam folder)." });
      }

      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' }); // Token expires in 1 hour
      sendForgotPasswordEmail(user.email, user.username, token);
      // Informing the user that an email has been sent
      res.status(200).json({ message: "Reset email sent. Check your inbox (and spam folder)." });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error occurred. Please try again later." });
  }
})

// ###### 

app.get("/users/exists/:username", async (req, res) => {
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

app.get("/user", authenticateToken, async (req, res) => {
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
      res.status(500).send("Error fetching user data");
  }
});

app.post('/users/addfriend', authenticateToken, async (req, res) => {
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



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


