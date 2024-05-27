import { Document,ObjectId } from 'mongoose';


interface Comment {
    text: string;
    userId: ObjectId | any; // Assuming userId is either a string or number
    time: Date;
}

  

interface PostInterface extends Document {
    painterId: string;
    media: string;
    description: string;
    comments: [Comment];
    time: Date;
    likes: string[];
    reportCount: number;
}

export default PostInterface;
