// socket/socket.js - FIXED to use "text" field
import Message from "../models/Message.js";
import User from "../models/User.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("join", (userId) => {
      const roomId = String(userId);
      socket.join(roomId);
      socket.userId = userId;
      console.log(`👤 User ${userId} joined room ${roomId}`);
      console.log(`📊 Rooms for this socket:`, Array.from(socket.rooms));
    });

    socket.on("send_message", async ({ sender, receiver, text }) => {
      try {
        console.log(`📨 Processing message: ${sender} → ${receiver}: "${text}"`);

        if (!sender || !receiver || !text) {
          console.error("❌ Invalid message data");
          return;
        }

        // Save with "text" field to match schema
        const newMessage = await Message.create({
          sender,
          receiver,
          text: text  // ← Save as "text" directly
        });

        console.log(`💾 Message saved to DB with ID: ${newMessage._id}`);

        // Fetch sender's username
        const senderUser = await User.findById(sender).select("username");
        const senderUsername = senderUser ? senderUser.username : "Unknown";

        // Prepare message payload
        const messagePayload = {
          _id: newMessage._id,
          sender: String(newMessage.sender),
          receiver: String(newMessage.receiver),
          text: newMessage.text,  // ← Use "text" field
          senderUsername: senderUsername,
          createdAt: newMessage.createdAt
        };

        const receiverRoom = String(receiver);
        const senderRoom = String(sender);

        console.log(`📤 Emitting to rooms: ${receiverRoom} and ${senderRoom}`);

        const socketsInReceiverRoom = await io.in(receiverRoom).fetchSockets();
        const socketsInSenderRoom = await io.in(senderRoom).fetchSockets();
        
        console.log(`👥 Sockets in receiver room (${receiverRoom}):`, socketsInReceiverRoom.length);
        console.log(`👥 Sockets in sender room (${senderRoom}):`, socketsInSenderRoom.length);

        io.to(receiverRoom).emit("receive_message", messagePayload);
        io.to(senderRoom).emit("receive_message", messagePayload);

        console.log(`✅ Message delivered with text: "${messagePayload.text}"`);
      } catch (err) {
        console.error("❌ Message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
      if (socket.userId) {
        console.log(`👋 User ${socket.userId} left`);
      }
    });
  });
};

export default socketHandler;