import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { socketHandler } from "./socketHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Doctor Assistant Backend is running 🚀");
});

// MongoDB
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("MongoDB connected"))
	.catch(err => console.error("MongoDB connection error:", err));

// Socket.io
const io = new Server(server, { cors: { origin: "*" } });
socketHandler(io);

server.listen(process.env.PORT || 5000, () => {
	console.log(`Backend running at http://localhost:${process.env.PORT || 5000}`);
});
