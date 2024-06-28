"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    conversationId: {
        type: String,
    },
    sender: {
        type: String,
    },
    text: {
        type: String
    }
}, { timestamps: true });
const MessageModel = (0, mongoose_1.model)("Message", MessageSchema);
exports.default = MessageModel;
//# sourceMappingURL=message.js.map