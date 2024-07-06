// socket.io.ts
import { Server } from "socket.io";
import ConversationModel from "../models/conversations";

let io: Server;

export const socketServer = (server: any) => {

    io = new Server(server, {
        cors: {
            origin:"*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });

        socket.on("slotBooked", (data:any) => {
            io.emit("slotBooked", data);
        });
        socket.on("joinNewUser",(data:{_id:string}[])=>{

            data.forEach(i=>{
                console.log(i?._id);
                
                 socket.join(i?._id);
            })
        })    
        socket.on("sendData",data=>{
            console.log(data,"----------data---------");
            console.log(data.conversationId);
            io.to(data.conversationId).emit("sendToUser",data)
            
        })

        socket.on("isSeen", (data) => {
            console.log("inside socket file",data);
            // io.to(conversationId).emit("messagesSeen", conversationId);
            // io.emit("msIsSeen", data);

            
        });
    });
};

export const getIO = () => io;

export const emitMessageSeen = (conversationId: string) => {
    const io = getIO();
    console.log("Emitting messageSeen for conversation:", conversationId);
    // io.emit("messageSeen", conversationId);
};
