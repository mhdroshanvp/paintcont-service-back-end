import { Server } from "socket.io";

interface User{
    userId:string;
    socketId:string
}

let users:User[] = []


export const socketServer = () => {

    const io = new Server({
        cors: {
            origin:'http://localhost:5173'
        }
    })

    io.on("connection",(socket) => {
        //whem connect
        console.log('A user is connected');

        //send message to the client we can use emit
        io.emit("welcome","this is socket server")
        socket.on("sendData",data=>{
            console.log(data,"------22222222222222222222222")
            io.emit("sendToUser",data)
        })
        //add user to the array
        // socket.on('addUser',(userId)=>{
        //     addUser(userId, socket.id)
        //     io.emit()
        // })
    })

    io.listen(3000)
}