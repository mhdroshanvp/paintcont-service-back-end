import mongoose, { Document, Schema, model } from "mongoose";
import { CommentInterface } from "../Interfaces/CommentInterface";


// Define the schema
const CommentSchema = new Schema<CommentInterface & Document>({
  postId: { type: String, required: true },
  painterId: { type: mongoose.Types.ObjectId, required: true },
  text: [ {
    userId: { type: mongoose.Types.ObjectId, required: true , ref:"User" },
    time: { type: Date, default: Date.now },
    content:{type:String}
  } ],
});

const CommentModel = model<CommentInterface & Document>("Comment", CommentSchema);

export default CommentModel;
