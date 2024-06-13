import mongoose, { Document, Schema, model } from "mongoose";
import { otpInterface } from "../Interfaces/otpInterface";

const OTPSchema = new Schema<otpInterface & Document>({
  userMail: {
    type: String,
  },
  otp: {
    type: Number
  },
  exp: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000) 
  }
});


OTPSchema.index({ exp: 1 }, { expireAfterSeconds: 0 }); 

const OTPModel = model<otpInterface & Document>("otp", OTPSchema);
export default OTPModel;
