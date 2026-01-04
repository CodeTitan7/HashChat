// models/Message.js - FIXED VERSION
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  text: {  
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Message", messageSchema);