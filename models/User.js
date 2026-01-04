// models/User.js - WITH UNIQUE USERNAME
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,  // Make username unique
    trim: true,
    lowercase: true  // Store in lowercase for easier searching
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


export default mongoose.model("User", userSchema);