"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.socketServer = void 0;
// socket.io.ts
const socket_io_1 = require("socket.io");
let io;
const socketServer = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            // origin: ["http://localhost:5173","https://paintcont.vercel.app"],
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("A user connected");
        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
        socket.on("slotBooked", (data) => {
            io.emit("slotBooked", data);
        });
        socket.on("joinNewUser", (data) => {
            data.forEach(i => {
                console.log(i === null || i === void 0 ? void 0 : i._id);
                socket.join(i === null || i === void 0 ? void 0 : i._id);
            });
        });
        socket.on("sendData", data => {
            console.log(data);
            console.log(data.conversationId);
            io.to(data.conversationId).emit("sendToUser", data);
        });
    });
};
exports.socketServer = socketServer;
const getIO = () => io;
exports.getIO = getIO;
//# sourceMappingURL=socket.io.js.map