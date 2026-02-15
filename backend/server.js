const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

// Import Routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');
const storyRoute = require('./routes/stories');

const app = express();

app.use(cors());
app.use(express.json());

// --- KEEP ALIVE ROUTE ---
app.get("/status", (req, res) => {
  res.send({ status: "TUK-TUKI Server is Live", time: new Date() });
});

// Use Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/stories', storyRoute);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch((err) => console.error('❌ Database Connection Error:', err));

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
    const userIndex = onlineUsers.findIndex((user) => user.userId === userId);
    if (userIndex !== -1) {
        onlineUsers[userIndex].socketId = socketId; 
    } else {
        onlineUsers.push({ userId, socketId }); 
    }
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", onlineUsers);
    });

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text,
            });
        }
    });

    socket.on("sendTyping", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getTyping", { senderId });
        }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("hideTyping", { senderId });
        }
    });

    socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
        const user = getUser(senderId);
        if (user) {
            io.to(user.socketId).emit("msgSeen", { messageId });
        }
    });

    socket.on("reactToStory", ({ senderId, receiverId, storyId, reaction }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getStoryReaction", { 
                senderId, storyId, reaction 
            });
        }
    });

    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", onlineUsers);
    });
});

// Render provides a port via process.env.PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});