import Message from "../models/Message.js";
import User from "../models/User.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      const roomId = String(userId);
      socket.join(roomId);
      socket.userId = userId;
    });

    socket.on("send_message", async ({ sender, receiver, text }) => {
      try {
        if (!sender || !receiver || !text) {
          return;
        }

        const newMessage = await Message.create({
          sender,
          receiver,
          text: text
        });

        const senderUser = await User.findById(sender).select("username");
        const senderUsername = senderUser ? senderUser.username : "Unknown";

        const messagePayload = {
          _id: newMessage._id,
          sender: String(newMessage.sender),
          receiver: String(newMessage.receiver),
          text: newMessage.text,
          senderUsername: senderUsername,
          createdAt: newMessage.createdAt
        };

        const receiverRoom = String(receiver);
        const senderRoom = String(sender);

        io.to(receiverRoom).emit("receive_message", messagePayload);
        io.to(senderRoom).emit("receive_message", messagePayload);
      } catch (err) {
        console.error("Message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};

export default socketHandler;
