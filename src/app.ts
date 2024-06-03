import express, { Express } from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";
import adminRoute from "./routes/adminRoute/adminRoute";
import userRoute from "./routes/userRoute/userRoute";
import painterRoute from "./routes/painterRoute/painterRoute";
import conversationRoute from "./routes/extraRoute/conversation";
import messageRoute from "./routes/extraRoute/message";
import { socketServer } from "./socket/socket.io";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const mongoURL: string = process.env.MONGO!;

app.use(express.json());
app.use(cookieParser());
app.use(morgan("tiny"));

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
}));

mongoose.connect(mongoURL)
  .then(() => {
    console.log("mongoDB connected 😁");
  })
  .catch((Error) => {
    console.log("there's an error in mongoDB", Error);
  });

server.listen(7777, () => {
  console.log("server connected 🥹");
});

socketServer()
app.use("/admin", adminRoute);
app.use("/user", userRoute);
app.use("/painter", painterRoute);
app.use("/conversation", conversationRoute);
app.use("/message", messageRoute);