import dotenv from "dotenv";
dotenv.config(); // Must be at the very top

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { socketHandler } from "./socketHandler.js";

console.log("OPENAI_API_KEY Loaded:", !!process.env.OPENAI_API_KEY);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Doctor Assistant Backend is running 🚀");
});

// MongoDB connection
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("MongoDB connected"))
	.catch(err => console.error("MongoDB connection error:", err));

// Socket.io
const io = new Server(server, { cors: { origin: "*" } });
socketHandler(io);

// Start server
server.listen(process.env.PORT || 5000, () => {
	console.log(`Backend running at http://localhost:${process.env.PORT || 5000}`);
});