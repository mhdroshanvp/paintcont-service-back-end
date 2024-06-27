import { Request, Response } from "express";
import MessageModel from "../../models/message";

///////////////////////////////////////////////////////////////////////

export const createMessage = async (req: Request, res: Response) => {
  const newMessage = new MessageModel(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json(error);
  }
};

///////////////////////////////////////////////////////////////////////

export const getMessagesByConversationId = async (req: Request, res: Response) => {
  try {
    const messages = await MessageModel.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};