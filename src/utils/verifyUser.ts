import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from 'jsonwebtoken'
import adminModel from "../models/adminModel";
import userModel from "../models/userModel";


export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token)
  if (!token) {
     //res.sendStatus(401);
    return  res.status(200).json({ success: false, message: "User blocked " })
  }

  try {
    
    const decoded: any = jwt.decode(token);

    
    const verifyUser = await userModel.findById(decoded.id)

    if (decoded?.role !== 'user') {
      res.status(200).json({ success: false, message: 'Unauthorized user' })
    }

    if (verifyUser?.isBlocked) {
      console.log('user is blocked');
      return res.status(200).json({ success: false, message: "User blocked " })
    }

    next()

  } catch (err) {
    console.error(err);
    return res.status(200).json({ success: false, message: "User blocked " })
  }
}