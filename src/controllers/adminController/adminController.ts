import { NextFunction, Request, Response } from "express";
import { AdminInterface } from "../../Interfaces/adminRepository/adminInterface";
import adminModel from "../../models/adminModel";
import { STATUS_CODES } from "../../constants/httpStatusCode"; 
import { ERR_MESSAGE } from "../../constants/httpStatusCode"; 
import { cutomError } from "../../Interfaces/customError";
import { token } from "morgan";

export const login = async (req: Request, res: Response, next: NextFunction) => {

  console.log('jhksdfjkahsdjkfhkajsdh')
 const { username, password} = req.body;
 console.log(req.body);
 

 try {
    const validAdmin = await adminModel.findOne({ username });

    if (!validAdmin) {
      const error: cutomError = {
        StatusCode: STATUS_CODES.NOT_FOUND.toString(),
        message: ERR_MESSAGE[STATUS_CODES.NOT_FOUND],
      };
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: error.message });
    }

    if (validAdmin && validAdmin.password !== password) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: "Incorrect password" });
    }

    console.log('yeah did it!',validAdmin.username);
    validAdmin.password = "";

    const expiry : Date = new Date(Date.now()+3600000)
    res.cookie('admin_token',token,{expires:expiry,secure:false}).status(200).json({user:validAdmin,token,success: true, message: 'user validated'})


 } catch (error) {
    console.error(error);
    next(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal error" });
 }
};