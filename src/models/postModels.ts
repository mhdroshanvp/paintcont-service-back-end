import mongoose, { Schema, Document, model, Model } from "mongoose";
import PostInterface from "../Interfaces/painterInterface/postInterface";


const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: String, required: true},
  time: { type: Date, default: Date.now }
});



const PostSchema: Schema = new Schema({
  painterId: { type: mongoose.Types.ObjectId, required: true,ref:'painter' },
  media: { type: String, required: true },
  description: { type: String, required: true },
  comments: [commentSchema],
  time: { type: Date, default: Date.now },
  likes: [],
  reportCount: { type: Number, default: 0 },
});

const PostModel: Model<PostInterface & Document> = model<PostInterface & Document>("Post", PostSchema);

export default PostModel;