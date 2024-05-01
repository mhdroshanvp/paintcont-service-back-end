import mongoose, { Schema, Document, model, Model } from "mongoose";
import PostInterface from "../Interfaces/painterInterface/postInterface";

const PostSchema: Schema = new Schema({
  painterId: { type: mongoose.Types.ObjectId, required: true,ref:'painter' },
  media: { type: String, required: true },
  description: { type: String, required: true },
  comments: { type: [String], default: [] },
  time: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
});

const PostModel: Model<PostInterface & Document> = model<PostInterface & Document>("Post", PostSchema);

export default PostModel;