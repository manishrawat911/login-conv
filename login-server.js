"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var http = require('http');
var socketIo = require('socket.io');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
app.use(cors());
var server = http.createServer(app);
var port = 5050;
var io = socketIo(server, {
    cors: {
        origin: "*", // Update this with your client's domain
        methods: ["GET", "POST"]
    }
});
app.use(bodyParser.json());
var users = [
    { username: "admin", password: "1234" }
];
var userSessions = new Map();
var sessionParticipants = [];
var sessionMessages = new Map();
var activeRooms = {};
// it should handle following requests:
// 1. handle authentication
// 2. 
app.post("/login/admin", function (request, response) {
    //fetch username and password from the body
    var _a = request.body, username = _a.username, password = _a.password;
    var user = users.find(function (user) { return user.username === username && user.password === password; });
    if (user) {
        response.json({ message: 'Login successful' });
    }
    else {
        response.status(401).json({ error: 'Invalid username or password' });
    }
});
app.post("/login/participant", function (request, response) {
    //fetch username and password from the body
    var _a = request.body, username = _a.username, password = _a.password, sessionId = _a.sessionId;
    var r_session = sessionParticipants.find(function (session) { return session.id == sessionId; });
    if (!r_session) {
        response.status(401).json({ error: 'Invalid session' });
    }
    var user = r_session === null || r_session === void 0 ? void 0 : r_session.participants.find(function (user) { return user.username === username && user.password === password; });
    if (user) {
        response.json({ message: 'Login successful' });
    }
    else {
        response.status(401).json({ error: 'Invalid username or password' });
    }
});
app.get("/session", function (request, response) {
    var username = request.body.username;
    var user = users.find(function (user) { return user.username === username; });
    if (user) {
        var session = userSessions.get(user.username);
        if (session) {
            response.json({ session: session });
        }
        else {
            response.status(404).json({ error: 'Session not found' });
        }
    }
    else {
        response.status(404).json({ error: 'User not found' });
    }
});
app.post("/session", function (request, response) {
    var data = request.body;
    console.log(data);
    var user = users.find(function (user) { return user.username === data.username; });
    if (user) {
        var sessionId = Math.random().toString(36).substring(7);
        var participants = data.participants;
        if (participants) {
            var temp_users = [];
            for (var _i = 0, participants_1 = participants; _i < participants_1.length; _i++) {
                var p = participants_1[_i];
                temp_users.push({ username: p.username, password: p.password });
            }
            var session = { id: sessionId, participants: temp_users };
            console.log("Session create: ".concat(sessionId, ", Users: ").concat(temp_users.toString()));
            sessionParticipants.push(session);
            userSessions.set(user.username, sessionId);
        }
        response.json({ sessionId: sessionId });
    }
    else {
        response.status(404).json({ error: 'User not found' });
    }
}); // to create a new session, returns the id of newly created session
app.get('/chatroom/:sessionId', function (req, res) {
    // Handle potential errors with sessionId
    var sessionId = req.params.sessionId;
    if (!sessionId) {
        //   return res.status(400).send('Missing sessionId parameter');
    }
    // Create a new namespace for the chatroom with the sessionId
    var chatroom = io.of("/chatroom/".concat(sessionId));
    chatroom.on('connection', function (socket) {
        console.log("Socket connected to chatroom: ".concat(sessionId));
        // Handle socket events specific to this chatroom
        socket.on('message', function (data) {
            console.log("Message received in ".concat(sessionId, ": ").concat(data));
            // Broadcast the message to all connected sockets in the chatroom
            chatroom.emit('message', data);
        });
        // Handle socket disconnection
        socket.on('disconnect', function () {
            console.log("Socket disconnected from chatroom: ".concat(sessionId));
        });
    });
    // Send a success response to the UI
    res.send('Chatroom created');
});
// const reg = /^/chatroom\/+\w
// const workspaces = io.of(/^\/chatroom\/+\w$/);
// workspaces.on("connection", (socket) => {
//     const namespace = socket.nsp;
//     console.log(`socket namespace: ${namespace}`)
// })
io.of('/hello').on("connection", function (socket) {
    console.log("Client connected at Hello");
});
io.on('connection', function (socket) {
    var roomId;
    // Handler for creating a new room
    socket.on('createRoom', function (payload) {
        // roomId = generateRoomId();
        activeRooms[payload.sessionId] = { users: [payload.username], messages: [] };
        socket.join(payload.sessionId);
        socket.emit('roomCreated', payload);
        console.log("Payload recieved:: ".concat(JSON.stringify(payload)));
    });
    socket.on('joinRoom', function (data) {
        // const { roomId: requestedRoomId } = data;
        //need to add authentication here
        var room = activeRooms[data.sessionId];
        if (room) {
            roomId = data.sessionId;
            socket.join(roomId);
            room.users.push(data.username);
            // Send chat history to the new user
            var chatHistory = room.messages.map(function (_a) {
                var username = _a.username, message = _a.message;
                return ({ username: username, message: message });
            });
            socket.emit('joinedRoom', { chatHistory: chatHistory });
            io.to(roomId).emit('userJoined', { userId: socket.id });
        }
    });
    // Handler for sending a message
    socket.on('sendMessage', function (data) {
        var sender = data.sender, roomId = data.roomId, message = data.message;
        // console.log(`message recieved: ${JSON.stringify(data)}`);
        console.log("message recieved: //".concat(sender, "//").concat(roomId, "//").concat(message));
        var room = activeRooms[roomId];
        if (room) {
            room.messages.push({ username: sender, message: message });
            io.to(roomId).emit('newMessage', { username: sender, message: message });
        }
    });
    // Handler for disconnecting
    socket.on('disconnect', function () {
        if (roomId) {
            var room = activeRooms[roomId];
            if (room) {
                room.users = room.users.filter(function (userId) { return userId !== socket.id; });
                io.to(roomId).emit('userLeft', { userId: socket.id });
                if (room.users.length === 0) {
                    console.log("deleting room: ".concat(roomId, " since total  users are: ").concat(room.users.length));
                    delete activeRooms[roomId];
                }
            }
        }
    });
});
server.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
//Helper functions
