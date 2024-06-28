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
exports.getConversationsByUserId = exports.createConversation = void 0;
const conversations_1 = __importDefault(require("../../models/conversations"));
const painterModel_1 = __importDefault(require("../../models/painterModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
///////////////////////////////////////////////////////////////////////
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    try {
        const conversation = yield conversations_1.default.find({
            members: { $in: [senderId] },
        });
        const conversatioNew = yield conversations_1.default.find({
            members: { $all: [senderId, receiverId] },
        });
        if (!conversatioNew.length) {
            if (!senderId || !receiverId) {
                return res.status(400).json({ message: "SenderId and ReceiverId are required" });
            }
            const newConversation = new conversations_1.default({
                members: [senderId, receiverId],
            });
            const savedConversation = yield newConversation.save();
            conversation.push(savedConversation);
        }
        const data = yield Promise.all(conversation.map((i) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const obj = Object.assign({}, i)._doc;
                const painterData = yield painterModel_1.default.findById(i.members[1]);
                const userData = yield userModel_1.default.findById(i.members[0]);
                obj.painterName = painterData || null;
                obj.userName = userData || null;
                return obj;
            }
            catch (error) {
                console.error(`Error fetching painter name: ${error}`);
                return i;
            }
        })));
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
exports.createConversation = createConversation;
///////////////////////////////////////////////////////////////////////
const getConversationsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield conversations_1.default.find({
            members: { $in: [req.params.userId] },
        });
        const data = yield Promise.all(conversation.map((i) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const obj = Object.assign({}, i)._doc;
                const painterData = yield painterModel_1.default.findById(i.members[1]);
                const userData = yield userModel_1.default.findById(i.members[0]);
                obj.painterName = painterData || null;
                obj.userName = userData || null;
                return obj;
            }
            catch (error) {
                console.error(`Error fetching painter name: ${error}`);
                return i;
            }
        })));
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
exports.getConversationsByUserId = getConversationsByUserId;
//# sourceMappingURL=conversationController.js.map