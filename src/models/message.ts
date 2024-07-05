import mongoose, { Document, Schema, model } from "mongoose";
import { MessageInterface } from "../Interfaces/MessageInterface";

const MessageSchema = new Schema<MessageInterface & Document>(
  {
    conversationId: {
      type: String,
    },
    sender:{
        type:String,
    },
    text:{
        type:String
    },
    isSeen:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);


const MessageModel = model<MessageInterface & Document>("Message", MessageSchema);

export default MessageModel;
