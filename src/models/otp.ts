// otp,emial

import mongoose, { Document, Schema, model } from "mongoose";
import { otpInterface } from "../Interfaces/otpInterface";

const OTPSchema = new Schema<otpInterface & Document>({
  userMail: {
    type: String,
  },
  otp:{
    type:Number
  }
  
});

const OTPModel = model<otpInterface & Document>("otp", OTPSchema);
export default OTPModel;