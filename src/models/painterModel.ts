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
            type: Number,
        },
        address: {
            country: String,
            state: String,
            city: String
        },
        experience: {
            type: String,
        },
        specialised: {
            type: [String],
            default: []
        },
        description: String,
        followers: {
            type: Number,
            default: 0 
        },
        premium: {
            type: Boolean,
            default: false,
        },
        premiumEndingDate: Date,
        isValid:{
            type:Boolean,
            default:false
        }

    });

    const painterModel = model<PainterInterface>(
    "painter",
    painterSchema
    );
    export default painterModel;
