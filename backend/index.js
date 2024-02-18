const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON bodies

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Create a schema for user information
const userSchema = new mongoose.Schema({
  username: String,
  profilePic: String
});

// Create a model for the user
const User = mongoose.model("User", userSchema);


// Create a message schema
const messageSchema = new mongoose.Schema({
  user: String,
  text: { type: String, required: true }, // Define text as a string type
  timestamp: { type: Date, default: Date.now }, // Add default value for timestamp
  room: String,
});

const Message = mongoose.model("Message", messageSchema);

// Endpoint to save user data upon login
app.post("/login", async (req, res) => {
  try {
    const { username, profilePic } = req.body;
    const user = new User({ username, profilePic });
    await user.save();
    res.status(201).json({ message: "User data saved successfully" });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ error: "Failed to save user data" });
  }
});

// Endpoint to retrieve user data
app.get("/user/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});



io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", async (data) => {
    console.log("Received message:", data["message"]);
    const newMessage = new Message({
      user: data.message.user,
      text: data.message.text,
      timestamp: new Date(),
      room: "general"
    });

    await newMessage.save();

    io.to(data.room).emit("message", newMessage);
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/getMessages/:room", async (req, res) => {
  const room = req.params.room;
  try {
    const messages = await Message.find({ room }).sort({ timestamp: 1 }); // Retrieve messages for the specified room sorted by timestamp
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
