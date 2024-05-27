import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from 'jsonwebtoken'
import adminModel from "../models/adminModel";
import userModel from "../models/userModel";


export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    
    const decoded: any = jwt.decode(token);

    console.log(decoded,"hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    
    const verifyUser = await userModel.findById(decoded.id)

    if (decoded?.role !== 'user') {
      res.status(401).json({ success: false, message: 'Unauthorized user' })
    }

    if (verifyUser?.isBlocked) {
      console.log('user is blocked');
      return res.status(403).json({ success: false, message: "User blocked " })
    }

    next()

  } catch (err) {
    console.error(err);
    return res.sendStatus(403);
  }
}