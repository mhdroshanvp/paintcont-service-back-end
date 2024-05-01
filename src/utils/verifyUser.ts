import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from 'jsonwebtoken'
import adminModel from "../models/adminModel";


export const verfiyJWT = async (req:Request,res:Response,next:NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.sendStatus(401);
    }
  
    try {
      const decoded: any = jwt.decode(token)      
      res.status(401).json({ success: false, message: 'Unauthorized user' })
      
      return next()
  
    }catch (err) {
      console.error(err);
      return res.sendStatus(403);
    }
}