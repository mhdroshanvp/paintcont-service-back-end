import mongoose, { ObjectId } from "mongoose";

export interface CommentInterface {
    postId: string;
    userId: string;
    time?: Date;
    painterId:ObjectId;
    text: [string]; 
}