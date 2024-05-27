import mongoose, { Document, Schema, model } from "mongoose";
import { ConversationInterface } from "../Interfaces/ConversationInterface";

// Define the schema
const ConversationSchema = new Schema<ConversationInterface & Document>(
  {
    members: {
      type: [String],
      required: true
    },
    
  },
  { timestamps: true }
);


const ConversationModel = model<ConversationInterface & Document>("Conversation", ConversationSchema);

export default ConversationModel;