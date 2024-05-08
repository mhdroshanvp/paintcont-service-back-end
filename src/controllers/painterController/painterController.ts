import { NextFunction, Request, Response } from "express";
import painterModel from "../../models/painterModel";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import OTPModel from "../../models/otp";
import jwt from "jsonwebtoken";
import PostModel from "../../models/postModels";
import { STATUS_CODES, ERR_MESSAGE } from "../../constants/httpStatusCode";


////////////////////////////////////////////////////////////


export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;
  console.log(req.body, "Body from painter controller");

  try {
    const existingPainter = await painterModel.findOne({ username });
    const existingEmail = await painterModel.findOne({ email });

    if (existingPainter) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.CONFLICT] });
    }

    if (existingEmail) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.CONFLICT] });
    }

    //OTP generation
    const generatedOTP: number = Math.floor(100000 + Math.random() * 900000);

    //Password hashing
    const hashedPass = bcryptjs.hashSync(password, 2) as string;

    if (!hashedPass) {
      throw new Error(ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR]);
    }

    const newPainter = new painterModel({
      username,
      email,
      password: hashedPass,
      otpCode: generatedOTP,
      isValid: false,
    });

    await newPainter.save();

    //Store email and OTP in the OTPModel collection
    const otpData = new OTPModel({
      userMail: email,
      otp: generatedOTP,
    });
    await otpData.save();

    //OTP mail setup
    console.log("Generated OTP is:", generatedOTP);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "paintcont.services@gmail.com",
        pass: "aexsubfytrfhhwcp",
      },
    });

    // Mail options
    const mailOptions = {
      from: "paintcont.services@gmail.com",
      to: req.body.email,
      subject: "OTP Verification",
      text: `Your OTP for verification of Paintcont is: ${generatedOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.paintcont.com`,
    };

    // Send OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
      } else {
        console.log("Email sent:", info.response);
        return res
          .status(STATUS_CODES.OK)
          .json({ success: true, message: "OTP sent successfully" });
      }
    });
  } catch (error: any) {
    console.log("Error at painter signup:", error);
    if (error.code === 11000) {
      const keyValue = error.keyValue;
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ success: false, message: `${keyValue} already exists` });
    }
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};


////////////////////////////////////////////////////////////


//otp section
export const otpVerification = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  console.log(req.body,"__________________________________");
  

  try {
    // Find the OTP record for the provided email
    const otpRecord = await OTPModel.findOne({ userMail: email });

    console.log(otpRecord,"[[[[[[[[[[[[[[[[[[[[[[[[[");
    

    // If OTP record not found, return error
    // if (!otpRecord) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "OTP not found for the provided email",
    //   });
    // }

    // Compare the provided OTP with the OTP stored in the database
    if (otpRecord?.otp !== parseInt(otp)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ERR_MESSAGE[STATUS_CODES.BAD_REQUEST],
      });
    }

    // If OTP is valid, update the user's validity status in the database
    const painter = await painterModel.findOne({ email });

    if (painter) {
      painter.isValid = true;
      await painter.save();
    } else {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: "Painter not found" });
    }

    // Delete the OTP record from the database
    // Return success response
    res.status(STATUS_CODES.OK).json({ success: true, message: "OTP verified successfully" });
  } catch (error: any) {
    console.log("Error at OTP verification:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};


////////////////////////////////////////////////////////////


export const resendOTP = async (req: Request, res: Response) => {
  try {
    console.log("inside the resend otp");
    console.log(req.body, "inside the resend otp api");

    const { email } = req.body;

    // Generate new OTP
    const newOTP: number = Math.floor(100000 + Math.random() * 900000);

    const existedOTP = await OTPModel.findOne({userMail:email})

    if(existedOTP){
      await OTPModel.deleteOne({ userMail: email });
    }
    const otpRecord = await OTPModel.create({
      userMail: email,
      otp: newOTP,
      new: true,
    });

    // Send new OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "paintcont.services@gmail.com",
        pass: "aexsubfytrfhhwcp",
      },
    });

    const mailOptions = {
      from: "paintcont.services@gmail.com",
      to: email,
      subject: "New OTP Verification",
      text: `Your new OTP for verification of Paintcont is: ${newOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.paintcont.com`,
    };

    transporter.sendMail(mailOptions,(error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
      } else {
        console.log("New OTP sent:------", newOTP);

        res.status(STATUS_CODES.OK).json({ success: true, message: "New OTP sent successfully" });

      }
    });
  } catch (error: any) {
    console.log("Error in resend OTP:", error.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};


////////////////////////////////////////////////////////////


export const painterLogin = async (req: Request, res: Response) => {

  try {
    const { username, password } = req.body;

    const painter = await painterModel.findOne({ username });

    console.log(painter,"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");


    if (!painter) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.NOT_FOUND] });
    }

    if(painter.isBlocked == true){
      return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.FORBIDDEN] });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      painter?.password as string
    );

    if (!isPasswordValid) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.UNAUTHORIZED] });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: painter._id, role:'painter' }, // Payload (can include any data you want to encode)
      process.env.JWT_SECRET || "your-secret-key", // Secret key
      { expiresIn: "1h" } // Expiry time

    );
    
    // Send token in cookie
    res.cookie("painter_token", token, { httpOnly: true }).status(STATUS_CODES.OK).json({
      user: painter,
      token,
      success: true,
      message: "Painter validated",
    });


  } catch (error: any) {
    console.log("Error in painter login:", error.message);
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};


////////////////////////////////////////////////////////////


export const createPost = async(req:Request,res:Response) => {
  try {
    console.log(req.body,"body in create post");
    const newPost = new PostModel({
      painterId:req.body.data.painterId,
      media:req.body.data.imageUrl,
      description:req.body.data.description
    })

    await newPost.save()
  } catch (error) {
    console.log(error);
    
  }
}


////////////////////////////////////////////////////////////


export const getAllPost = async(req:Request,res:Response) => {
  try {
    const post = await PostModel.find().populate({
      path: 'painterId',
      model: 'painter' // Use the name of the model defined in your painterModel export
    });
    

    console.log(post,"<<<<<<<");
    
    
    console.log(post);
    

    res.status(STATUS_CODES.OK).json({success:true,post})
  } catch (error) {
    console.log(error);
  }
}


////////////////////////////////////////////////////////////


export const painterProfile = async (req:Request,res:Response) => {
  try {
    const id = req.params.id

    console.log(id,": painterProfileId");
    
    
    const painter = await painterModel.findById(id)
    
    console.log(painter,": painterProfile");

    if(!painter){
      return res.status(404).json({ message: "Painter not found" });
    }

    return res.status(200).json({ message: "Painter address fetched successfully", painter });

  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}