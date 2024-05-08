import { NextFunction, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import OTPModel from "../../models/otp";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel";
import PostModel from "../../models/postModels";
import painterModel from "../../models/painterModel";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  console.log("inside the user signup ");
  
  const { username, email, password } = req.body;
  console.log(req.body, "Body from painter controller");

  try {
    const existingPainter = await userModel.findOne({ username });
    const existingEmail = await userModel.findOne({ email });

    if (existingPainter) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" })
    }

    //OTP generation
    const generatedOTP: number = Math.floor(100000 + Math.random() * 900000);

    //Password hashing
    const hashedPass = bcryptjs.hashSync(password, 2) as string;

    if (!hashedPass) {
      throw new Error("Password hashing failed");
    }

    //Create new painter document
    await userModel.create({
      username,
      email,
      password:hashedPass,
      isValid:false
    })
    // const newUser = new userModel({
    //   username,
    //   email,
    //   password: hashedPass,
    //   otpCode: generatedOTP,
    //   isValid: false,
    // });

    // await newUser.save();

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
          .status(400)
          .json({ success: false, message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        return res
          .status(250)
          .json({ success: true, message: "OTP sent successfully" });
      }
    });
  } catch (error: any) {
    console.log("Error at user signup:", error);
    if (error.code === 11000) {
      const keyValue = error.keyValue;
      return res
        .status(409)
        .json({ success: false, message: `${keyValue} already exists` });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


//////////////////////////////////////////////////////////////////


//otp section
export const otpVerification = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    // Find the OTP record for the provided email
    const otpRecord = await OTPModel.findOne({ userMail: email });

    // If OTP record not found, return error
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found for the provided email",
      });
    }

    // Compare the provided OTP with the OTP stored in the database
    if (otpRecord.otp !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // If OTP is valid, update the user's validity status in the database
    const user = await userModel.findOne({ email });
    if (user) {
      user.isValid = true;
      await user.save();
    } else {
      return res.status(400).json({ success: false, message: "Painter not found" });
    }
~
    // Return success response
    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error: any) {
    console.log("Error at OTP verification:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mail4otp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      // Generate OTP
      const generatedOTP: number = Math.floor(100000 + Math.random() * 900000);

      // Store OTP in the OTPModel collection
      const otpData = new OTPModel({
        userMail: email,
        otp: generatedOTP,
      });

      await otpData.save();

      // Send OTP via email
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
        subject: "OTP Verification",
        text: `Your OTP for verification of Paintcont is: ${generatedOTP}. 
              Do not share the OTP with anyone.
              For further details and complaints visit www.paintcont.com`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res
            .status(400)
            .json({ success: false, message: "Error sending email" });
        } else {
          console.log("Email sent:", info.response);
          return res.status(200).json({ success: true, message: "OTP sent successfully" });
        }});
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Email does not exist" });
    }
  } catch (error: any) {
    console.log("Error in mail4otp:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
          .status(400)
          .json({ success: false, message: "Error sending email" });
      } else {
        console.log("New OTP sent:------", newOTP);
        res.status(200).json({ success: true, message: "New OTP sent successfully" });
      }
    });
  } catch (error: any) {
    console.log("Error in resend OTP:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};  


////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const userLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Username not found" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      user?.password as string
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user._id,role:'user' },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    // Send token in cookie
    res.cookie("token", token, { httpOnly: true }).status(200).json({
      user: user,
      token,
      success: true,
      message: "User validated",
    });
  } catch (error: any) {
    console.log("Error in user login:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const getAllPost = async(req:Request,res:Response) => {
  try {
    const post = await PostModel.find().populate("painterId")

    console.log(post,"<<<<<<<");
    
    
    console.log(post);
    

    res.status(200).json({success:true,post})
  } catch (error) {
   console.log(error);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const updateLike = async (req: Request, res: Response) => {
  try {
    const { postId, liked } = req.body;

    // Fetch the post from the database
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Increment or decrement the like count based on the 'liked' parameter
    if (liked) {
      post.likes += 1; // Increment like count
    } else {
      post.likes -= 1; // Decrement like count
    }

    // Save the updated post back to the database
    const updatedPost = await post.save();

    res.status(200).json({ success: true, message: "Like status updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating like status:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};





////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const userProfile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const { phone, address } = req.body;

    const user = await userModel.findById(id);

    console.log(user);
    

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.address = address;

    await user.save();

    return res.status(200).json({ message: "Address added successfully", user });
  }catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


///////////////////////////////////////////////////////////////////////////

export const handleReport = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;

    console.log(req.body,";;;;;;;;;;;;;;;;;;");
    

    const post = await PostModel.findByIdAndUpdate(postId, { $inc: { reportCount: 1 } }, { new: true });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    console.log(' report count --- ', post.reportCount)

    if (post.reportCount === 1) {
      return res.status(200).json({ 
        success: true, 
        message: 'Report count updated successfully', 
        reportLimitReached: true 
      });
    }

    res.status(200).json({ success: true, message: 'Report count updated successfully' });
  } catch (error) {
    console.error('Error handling report:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


///////////////////////////////////////////////////////////////////////////

export const searchPainters = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;  

    const Name=new RegExp(name,'i')

    console.log(name,"from the backend");
    
    const posts  = await PostModel.find().populate({path:'painterId',match:{username:{$regex:Name}}})

    const filteredPosts=posts.filter(post=>post.painterId!==null)

    console.log(filteredPosts,"ppppppppppppppppppppppppppp");
    
    

    res.status(200).json({ success: true, filteredPosts});
  } catch (error) {
    console.error("Error searching painters:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




export const addAddress = async (req:Request,res:Response) => {
  try {
    console.log(req.body,";;;;;;;;;;;;;;;;;;;;;;;");
    const {address,phoneNo,userId} = req.body

    const newUserAddress = {
        houseNo: address.houseNo,
        location: address.location, 
        pin: address.pin
    }

    // console.log(newUserAddress,"11111111111111111111111111111111111111111111111111111111111111111111111");
    

    const user:any = await userModel.findById(userId)
    // console.log(user,"lllllllllllllllllllll");

    user.address = newUserAddress;

// Now, update the user document with both the phone and address
const updatedUser = await userModel.findByIdAndUpdate(userId, { phone: phoneNo, address: user.address }, { new: true });

// console.log(updatedUser,"gggggggggggggggggggggggggggggggggggggggg");

    if (!updatedUser) {
        throw new Error('User not found');
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    
  } catch (error) {
    
  }
}