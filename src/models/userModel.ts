import mongoose, { Document, Schema, model } from "mongoose";
import { UserInterface } from "../Interfaces/userInterface/userInterface";

// Define the user schema
const userSchema = new Schema<UserInterface & Document>({
    username: {
        type: String,
        required: true,
        unique: true,
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

// Create and export the model
const userModel = model<UserInterface & Document>("User", userSchema);
export default userModel;