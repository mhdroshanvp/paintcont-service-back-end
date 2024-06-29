import { NextFunction, Request, Response } from "express";
import painterModel from "../../models/painterModel";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import OTPModel from "../../models/otp";
import jwt from "jsonwebtoken";
import PostModel from "../../models/postModels";
import { STATUS_CODES, ERR_MESSAGE } from "../../constants/httpStatusCode";
import SlotModel from "../../models/slots";


////////////////////////////////////////////////////////////

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;

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

    if (!password) {
      throw new Error('Password is missing');
    }


    const newPainter = new painterModel({
      username,
      email,
      password: hashedPass,
      otpCode: generatedOTP,
      isValid: false,
    });

    await newPainter.save();

    const otpData = new OTPModel({
      userMail: email,
      otp: generatedOTP,
    });
    await otpData.save();

    //OTP mail setup
    console.log("Generated OTP is:", generatedOTP)
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


export const otpVerification = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTPModel.findOne({ userMail: email });


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

    res.status(STATUS_CODES.OK).json({ success: true, message: "OTP verified successfully" });
  } catch (error: any) {
    console.log("Error at OTP verification:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};


////////////////////////////////////////////////////////////


export const resendOTP = async (req: Request, res: Response) => {
  try {


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
      { username: painter._id, role:'painter' }, 
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" } 
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


export const createPost = async (req: Request, res: Response) => {
  try {

    
    // console.log(req.body);
    const { painterId, imageUrl, description, specialised ,postId} = req.body;

    //const response = await axios.head(imageUrl);
  

    // if (!response.headers['content-type'].startsWith('image/')) {
    //   return res.status(400).json({ error: 'Invalid image URL' });
    // }

    const result = await PostModel.updateMany({_id:postId},{$set:{media:imageUrl,description:description}})

    if(!result.modifiedCount){

    const newPost = new PostModel({
      painterId: painterId,
      media: imageUrl,
      description: description,
      specialised, 
    });

    await newPost.save();
  }

    res.status(201).json({ message: 'Post created successfully', status:true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




////////////////////////////////////////////////////////////


export const painterProfile = async (req: Request, res: Response) => {
  try {

    
    const id = req.params.id;

    const painter = await painterModel.findById(id);

    if (!painter) {
      return res.status(404).json({ message: "Painter not found" });
    }

    const posts = await PostModel.find({ painterId: painter._id });

    return res.status(200).json({
      message: "Painter profile and posts fetched successfully",
      painter,
      posts,
    });

  } catch (error) {
    console.error("Error fetching painter profile and posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

////////////////////////////////////////////////////////////


export const updatePainterDetails = async (req:Request, res:Response) => {
  const painterId = req.params.id;
  const details = req.body;
  
  
  try {
    const painter = await painterModel.findByIdAndUpdate(painterId, details, { new: true });
    if (!painter) {
      return res.status(404).json({ message: "Painter not found" });
    }
    res.json({ message: "Details updated successfully", painter });
  } catch (error) {
    console.error("Error updating details:", error);
    res.status(500).json({ message: "Failed to update details" });
  }
};


////////////////////////////////////////////////////////////

export const createSlot = async (req: Request, res: Response) => {
  try {
    const [data] = req.body.slots;
    const { date, amount } = data;
    const { painterId } = req.params;

    const existingSlot = await SlotModel.findOne({ painterId, date });

    if (existingSlot) {
      return res.status(409).json({ message: 'Slot already exists' });
    }

    const newSlot = new SlotModel({
      date,
      amount,
      painterId,
    });

    await newSlot.save();

    return res.status(201).json({ message: 'Slot created successfully', slot: newSlot });
  } catch (error) {
    console.error('Error creating slot:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


////////////////////////////////////////////////////////////

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(404).json({ message: "Post ID not found" });
    }

    const deletedPost = await PostModel.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Post deleted successfully", deletedPost });
    
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
