import mongoose from 'mongoose';

import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    email: String,
    friends: [String]
  });
  
  const UserModel = mongoose.model("users", userSchema);
  
  export default UserModel;