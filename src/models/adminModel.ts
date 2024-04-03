import mongoose,{Document,Schema,model} from "mongoose";
import { AdminInterface } from "../Interfaces/adminRepository/adminInterface";

const adminSchema = new Schema<AdminInterface & Document>({
    username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
})


const adminModel = model<AdminInterface & Document>('admin',adminSchema)
export default adminModel;