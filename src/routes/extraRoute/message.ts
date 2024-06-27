import express from "express";
import { createMessage, getMessagesByConversationId } from "../../controllers/messageController/messageController";

const router = express.Router();

router.post("/", createMessage);
router.get("/:conversationId", getMessagesByConversationId);

export default router;