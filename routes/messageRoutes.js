// routes/messageRoutes.js - UPDATED WITH USERNAME SUPPORT
import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).send("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
};

// Search users by username (for autocomplete/search)
router.get("/users/search", verifyToken, async (req, res) => {
  try {
    const { q } = req.query;  // query parameter: ?q=john
    
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    // Search for users whose username starts with or contains the query
    const users = await User.find({
      username: { $regex: q.toLowerCase(), $options: "i" },
      _id: { $ne: req.userId }  // Exclude the current user
    })
    .select("username email _id")
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).send("Search failed");
  }
});

// Get user by username
router.get("/user/username/:username", verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ 
      username: username.toLowerCase() 
    }).select("username email _id");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error("Error fetching user by username:", err);
    res.status(500).send("Failed to fetch user");
  }
});

// Get user by ID (keep for backward compatibility)
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("username email");
    
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Failed to fetch user");
  }
});

// Get chat history between current user and another user (by their user ID)
router.get("/messages/:userId/:otherUserId", verifyToken, async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    // Verify the requesting user is one of the participants
    if (req.userId !== userId) {
      return res.status(403).send("Unauthorized");
    }

    // Get messages where user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 }).limit(100);

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send("Failed to fetch messages");
  }
});

export default router;