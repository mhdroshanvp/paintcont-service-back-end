import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload, decode } from "jsonwebtoken";
import jwtDecode from 'jsonwebtoken'
import adminModel from "../models/adminModel";
import userModel from "../models/userModel";


export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("🤬🤬🤬");
    return res.sendStatus(401);
  }

  try { 
    
    const decoded:any = await jwt.decode(token);
    // console.log(decoded,"✅");


    
    const verifyUser = await userModel.findById(decoded.username)

    // console.log(verifyUser,"🚒🚒🚒🚒🚒");
    

    

    if (decoded?.role !== 'user') {
      res.status(401).json({ success: false, message: 'Unauthorized user' })
    }

    if (verifyUser?.isBlocked) {
      console.log('user is blocked');
      return res.status(200).json({ success: true, message: "User blocked",blocked:true })
    }

    next()

  } catch (err) {
    console.error(err);
    return res.sendStatus(403);
  }
}