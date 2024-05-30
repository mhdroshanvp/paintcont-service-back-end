import mongoose, { Document, Schema, model } from "mongoose";
import PainterInterface from "../Interfaces/painterInterface/painterInterface";

const painterSchema = new Schema<PainterInterface>({
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
        type: String,  // Changed to String to accommodate different phone number formats
    },
    address: {
        country: String,
        state: String,
        city: String
    },
    age: {
        type: Number,
    },
    experienceYears: {
        type: Number,
    },
    specialised: {
        type: [String],
        default: []
    },
    description: String,
    aboutMe: String,
    premium: {
        type: Boolean,
        default: false,
    },
    premiumEndingDate: Date,
    isValid: {
        type: Boolean,
        default: false
    },
    followers: {
        type: [String],
        default: []
    },
    location:{type:String}
});

const painterModel = model<PainterInterface>("painter", painterSchema);
export default painterModel;
