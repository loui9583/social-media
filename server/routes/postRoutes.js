import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { PostModel } from '../db/models/postModel.js';

import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const newPost = new PostModel({
    content: content,
    author: req.user._id,
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

router.get('/', authenticateToken, async (req, res) => {
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;
  const skip = (page - 1) * limit;

  try {

    const posts = await PostModel.find({ author: { $in: req.user.friends } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username');
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching posts");
  }
});

router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error: Unable to retrieve post");
  }
});

router.post('/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const comment = {
    content: content,
    author: req.user._id,
    createdAt: new Date(),
    username: req.user.username
  };

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true }
    ).populate('comments.author', 'username');

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding comment");
  }
});

export default router;