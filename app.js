"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const mongoose_1 = __importDefault(require("mongoose"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute/adminRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute/userRoute"));
const painterRoute_1 = __importDefault(require("./routes/painterRoute/painterRoute"));
const conversation_1 = __importDefault(require("./routes/extraRoute/conversation"));
const message_1 = __importDefault(require("./routes/extraRoute/message"));
const socket_io_1 = require("./socket/socket.io");
const stripeRoute_1 = __importDefault(require("./routes/stripeRoute/stripeRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const mongoURL = process.env.MONGO;
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("tiny"));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
}));
mongoose_1.default.connect(mongoURL)
    .then(() => {
    console.log("mongoDB connected 😐");
})
    .catch((Error) => {
    console.log("there's an error in mongoDB 😭", Error);
});
(0, socket_io_1.socketServer)(server);
server.listen(7777, () => {
    console.log("server connected 😁");
});
app.use("/admin", adminRoute_1.default);
app.use("/user", userRoute_1.default);
app.use("/painter", painterRoute_1.default);
app.use("/conversation", conversation_1.default);
app.use("/message", message_1.default);
app.use("/stripe", stripeRoute_1.default);
//# sourceMappingURL=app.js.map