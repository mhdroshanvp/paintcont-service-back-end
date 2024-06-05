// socket.io.ts
import { Server } from "socket.io";

let io: Server;

export const socketServer = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // replace with your frontend URL
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
    });
};

export const getIO = () => io;
