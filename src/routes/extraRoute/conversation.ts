import express from "express";
import { createConversation, getConversationsByUserId } from "../../controllers/messageController/conversationController";

const router = express.Router();

router.post("/", createConversation);
router.get("/:userId", getConversationsByUserId);

export default router;
