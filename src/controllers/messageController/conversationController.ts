import { Request, Response } from "express";
import ConversationModel from "../../models/conversations";
import painterModel from "../../models/painterModel";
import userModel from "../../models/userModel";
import  MessageModel from "../../models/message"
///////////////////////////////////////////////////////////////////////

export const createConversation = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.body;

  try {
    const conversation = await ConversationModel.find({
      members: { $in: [senderId] },
    });

    const conversatioNew = await ConversationModel.find({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversatioNew.length) {
      if (!senderId || !receiverId) {
        return res.status(400).json({ message: "SenderId and ReceiverId are required" });
      }

      const newConversation = new ConversationModel({
        members: [senderId, receiverId],
      });

      const savedConversation = await newConversation.save();
      conversation.push(savedConversation);
    }

    const data = await Promise.all(
      conversation.map(async (i: any) => {
        try {
          const obj = { ...i }._doc;
          const painterData = await painterModel.findById(i.members[1]);
          const userData = await userModel.findById(i.members[0]);
          obj.painterName = painterData || null;
          obj.userName = userData || null;
          obj.messages = await MessageModel.findById(obj._id) || null
          return obj;
        } catch (error) {
          console.error(`Error fetching painter name: ${error}`);
          return i;
        }
      })
    );
    console.log(data,"----")
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};


///////////////////////////////////////////////////////////////////////


export const getConversationsByUserId = async (req: Request, res: Response) => {
  try {
    const conversation = await ConversationModel.find({
      members: { $in: [req.params.userId] },
    })
    // .sort({ updatedAt: -1 });

    const data = await Promise.all(
      conversation.map(async (i: any) => {
        try {
          const obj = { ...i }._doc;
          const painterData = await painterModel.findById(i.members[1]);
          const userData = await userModel.findById(i.members[0]);
          obj.painterName = painterData || null;
          obj.userName = userData || null;
          console.log(obj._id)
          obj.messages = await MessageModel.find({conversationId:obj._id}) || null

          return obj;
        } catch (error) {
          console.error(`Error fetching painter name: ${error}`);
          return i;
        }
      })
    );
// console.log(data[0].messages[data[0].messages.length-1],"-------------")
data.sort((a,b)=>{
  return (b.messages[b.messages.length-1]?.createdAt || null) - (a.messages[a.messages.length-1]?.createdAt || null)
})
// console.log(data,"ffffffffffffffffffff")
    res.status(200).json(data);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};