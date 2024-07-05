import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload, decode } from "jsonwebtoken";
import jwtDecode from 'jsonwebtoken'
import painterModel from "../models/painterModel";


export const verifyPainter = async (req: Request, res: Response, next: NextFunction) => {
  
  const authHeader = req.headers.authorization;
  console.log();
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("🤬🤬🤬");
    return res.sendStatus(401);
  }

  try { 
    
    const decoded:any = await jwt.decode(token);
    console.log(decoded,"✅");


    
    const verifyPainter = await painterModel.findById(decoded.username)

    console.log(verifyPainter,"🚒🚒🚒🚒🚒");
    

    

    if (decoded?.role !== 'painter') {
      res.status(401).json({ success: false, message: 'Unauthorized painter' })
    }

    if (verifyPainter?.isBlocked) {
      console.log('user is blocked');
      return res.status(200).json({ success: true, message: "User blocked",blocked:true })
    }

    next()

  } catch (err) {
    console.error(err);
    return res.sendStatus(403);
  }
}