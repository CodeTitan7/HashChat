import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import greetRoute from "./routes/greet.js";
import messageRoutes from "./routes/messageRoutes.js"; 
import socketHandler from "./socket/socket.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: "*",
    credentials: true
  }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", messageRoutes);
app.use("/", greetRoute);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
