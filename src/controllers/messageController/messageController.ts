import { Request, Response } from "express";
import MessageModel from "../../models/message";
import { emitMessageSeen } from '../../socket/socket.io';

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


///////////////////////////////////////////////////////////////////////

export const isSeen = async (req:Request,res:Response) => {
  try {  
    const {conversationId} = req.body
    const data = await MessageModel.updateMany({ conversationId, isSeen: false },{ $set: { isSeen: true } });    

    emitMessageSeen(conversationId);

    res.status(200).json({ success: true, message: "Messages updated to seen" });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error});
  }
}