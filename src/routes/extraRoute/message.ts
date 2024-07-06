import express from "express";
import { createMessage, getMessagesByConversationId, isSeen } from "../../controllers/messageController/messageController";

const router = express.Router();

router.post("/", createMessage);
router.get("/:conversationId", getMessagesByConversationId);
router.post("/updateIsSeen",isSeen)

export default router;