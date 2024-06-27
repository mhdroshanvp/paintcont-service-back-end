import { ObjectId } from "mongoose";
export interface SlotInterface {
    date?: Date; 
    painterId?: string; 
    userId?:ObjectId;
    status?:string;
    amount?:number  
}
