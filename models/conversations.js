"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ConversationSchema = new mongoose_1.Schema({
    members: {
        type: [String],
        required: true
    },
}, { timestamps: true });
const ConversationModel = (0, mongoose_1.model)("Conversation", ConversationSchema);
exports.default = ConversationModel;
//# sourceMappingURL=conversations.js.map