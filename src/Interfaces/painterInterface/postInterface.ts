import { Document } from 'mongoose';

interface PostInterface extends Document {
    painterId: string;
    media: string;
    description: string;
    comments: string[];
    time: Date;
    likes: number;
    reportCount: number;
}

export default PostInterface;
