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

let connectedUsers = [{ username: '' }];


dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET;

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

const commentSchema = new mongoose.Schema({
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: Date.now },
  username: String
});

const postSchema = new mongoose.Schema({
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: Date.now },
  comments: [commentSchema], // Embedding comments directly in the post
  username: String
});

const PostModel = mongoose.model("Post", postSchema);


const chatRoomSchema = new mongoose.Schema({
  roomName: String,
  createdAt: { type: Date, default: Date.now },
  messages: [{message: String, username: String}]
});

const chatRoomModel = mongoose.model("chatRoom", chatRoomSchema);



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
      connectedUsers.push(user);
      console.log('Connected users: ')
      console.log(connectedUsers)
      console.log('User authenticated:', user.username);

      // Join room event
      socket.on('join room', async (roomUsername) => {
        const username = socket.user.username;
        const room = [roomUsername].sort().join('-');
        socket.join(room);
        console.log(`User joined room: ${room}`);
        const c = await chatRoomModel.findOne({roomName: room});
        if (!c){
          const newChatRoom = new chatRoomModel({
            roomName: room,
            messages: []  // Initializing an empty array for messages
        });

        await newChatRoom.save();
            console.log(`New room created: ${room}`);
        }
      });

      // Handle chat messages within the room
      socket.on('chat message', ({ room, message }) => {
        console.log(`${user.username} in room ${room}: ${message}`);
        // Broadcast to all clients in the room
        io.to(room).emit('chat message', { message: message, username: user.username });
      });

      // Disconnect event
      socket.on('disconnect', () => {
        console.log(`${socket.user.username} disconnected`);
        // Optionally, remove the user from the connectedUsers array
        const index = connectedUsers.indexOf(socket.user);
        if (index > -1) {
          connectedUsers.splice(index, 1);
        }
        console.log('Updated list of connected users:', connectedUsers);
      });
    }
  });
});

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
    console.error(error); c
    res.status(500).send("Error creating user");
  }
});

app.get("/chatroom/:roomname", authenticateToken, async (req, res) => {
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


app.post("/chatroom/:roomname", authenticateToken, async (req, res) => {
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

app.get('/users/isconnected/:username', async (req, res) => {
  const { username } = req.params;
  let result = false;
  for (let user of connectedUsers) {
    if (user.username === username) result = true;
  }
  res.json({ isConnected: result });
})

app.post('/posts', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const newPost = new PostModel({
    content: content,
    author: req.user._id,  // Assuming req.user._id is set from authenticateToken middleware
    username: req.user.username
  });

  try {
    await newPost.save();
    res.status(201).send(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error posting content");
  }
});

app.get('/posts', authenticateToken, async (req, res) => {
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;
  const skip = (page - 1) * limit;

  try {

    const posts = await PostModel.find({ author: { $in: req.user.friends } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username');  // Optional: populate author info
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching posts");
  }
});

app.get('/post/:postId', async (req, res) => {
  const { postId } = req.params;
  const post = await PostModel.findById(postId);
  res.json(post);
});

app.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const comment = {
    content: content,
    author: req.user._id,  // Assuming req.user._id is set from authenticateToken middleware
    createdAt: new Date(),
    username: req.user.username
  };

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true } // Returns the updated document
    ).populate('comments.author', 'username');

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding comment");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


