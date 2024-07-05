import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload, decode } from "jsonwebtoken";
import jwtDecode from 'jsonwebtoken'
import adminModel from "../models/adminModel";


export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("🤬🤬🤬");
    return res.sendStatus(401);
  }

  try { 
    
    const decoded:any = await jwt.decode(token);
    console.log(decoded,"✅");

    // let adminName = decoded?.username
    
    // const verifyAdmin = await adminModel.find({name:adminName})

    // console.log(verifyAdmin,"🚒🚒🚒🚒🚒");
    

    

    // if (decoded?.role !== 'admin') {
    //   res.status(401).json({ success: false, message: 'Unauthorized Admin' })
    // }

    next()

  } catch (err) {
    console.error(err);
    return res.sendStatus(403);
  }
}