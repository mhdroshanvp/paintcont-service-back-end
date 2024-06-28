"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByConversationId = exports.createMessage = void 0;
const message_1 = __importDefault(require("../../models/message"));
///////////////////////////////////////////////////////////////////////
const createMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newMessage = new message_1.default(req.body);
    try {
        const savedMessage = yield newMessage.save();
        res.status(200).json(savedMessage);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
exports.createMessage = createMessage;
///////////////////////////////////////////////////////////////////////
const getMessagesByConversationId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield message_1.default.find({
            conversationId: req.params.conversationId,
        });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
exports.getMessagesByConversationId = getMessagesByConversationId;
//# sourceMappingURL=messageController.js.map