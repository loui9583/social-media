import mongoose from 'mongoose';

import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
// Define the commentSchema first
const commentSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    username: String
});

// Now define postSchema using commentSchema
const postSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    comments: [commentSchema], // Embedding comments directly in the post
    username: String
});

const PostModel = mongoose.model("Post", postSchema);

export { PostModel, commentSchema };
