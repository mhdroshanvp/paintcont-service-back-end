// slotModel.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import { SlotInterface } from "../Interfaces/slotInterface";

const slotSchema = new Schema<SlotInterface & Document>({
    date: {
        type: Date,
        required: true
    },
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    painterId: {
        type: String,
        ref: 'Painter',
        required: true
    },
    userId: {
        type: String,
        ref: 'User'
    },
    status:{
        type:String,
        default:"pending"
    }
});

const SlotModel: Model<SlotInterface & Document> = mongoose.model("Slot", slotSchema);

export default SlotModel;
