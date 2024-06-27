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
            console.log(data);
            console.log(data.conversationId);
            
            io.to(data.conversationId).emit("sendToUser",data)
            
        })
    });
};

export const getIO = () => io;
