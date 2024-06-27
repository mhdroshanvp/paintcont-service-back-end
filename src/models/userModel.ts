import mongoose, { Document, Schema, model } from "mongoose";
import { UserInterface } from "../Interfaces/userInterface/userInterface";

const userSchema = new Schema<UserInterface & Document>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    profile: String,
    phone: {
        type: Number,
     },
    address: {
        houseNo: Number,
        location: String,
        pin: Number
    },
    isValid:{
        type:Boolean,
        default:false
    }
});

const userModel = model<UserInterface & Document>("User", userSchema);
export default userModel;