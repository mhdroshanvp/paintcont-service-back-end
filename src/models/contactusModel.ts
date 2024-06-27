import mongoose, { Document, Schema, model } from "mongoose";
import { contactInterface } from "../Interfaces/contactusInterface";

const contactSchema = new Schema<contactInterface & Document>({
  name: { type: String, required: true },
  mail: { type: String, required: true },
  message: { type: String, required: true },
});

const modelName = 'ContactUs';

let contactModel: mongoose.Model<contactInterface & Document>;

if (mongoose.models[modelName]) {
  contactModel = mongoose.models[modelName] as mongoose.Model<contactInterface & Document>;
} else {
  contactModel = model<contactInterface & Document>(modelName, contactSchema);
}

export default contactModel;
