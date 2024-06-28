import { NextFunction, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import { Server } from "socket.io";
import OTPModel from "../../models/otp";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel";
import PostModel from "../../models/postModels";
import painterModel from "../../models/painterModel";
import ConversationModel from "../../models/conversations";
import MessageModel from "../../models/message";
import CommentModel from "../../models/commentModel";
import mongoose,{ObjectId} from "mongoose";
import SlotModel from "../../models/slots";
import bookingModel from "../../models/BookingModel";
import { getIO } from "../../socket/socket.io"; 
import contactModel from "../../models/contactusModel";


export const signup = async (req: Request, res: Response, next: NextFunction) => {

  const { username, email, password } = req.body;
  

  const cleanedUsername = username.replace(/\s+/g, '').toLowerCase();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  try {
    const existingPainter = await userModel.findOne({ username: cleanedUsername });
    const existingEmail = await userModel.findOne({ email: trimmedEmail });

    if (existingPainter) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // OTP generation
    const generatedOTP: number = Math.floor(100000 + Math.random() * 900000);

    // Password hashing
    const hashedPass = bcryptjs.hashSync(trimmedPassword, 2) as string;

    if (!hashedPass) {
      throw new Error("Password hashing failed");
    }

    // Create new painter document
    await userModel.create({
      username: cleanedUsername,
      email: trimmedEmail,
      password: hashedPass,
      isValid: false,
    });

    // Store email and OTP in the OTPModel collection
    const otpData = new OTPModel({
      userMail: trimmedEmail,
      otp: generatedOTP,
    });
    await otpData.save();

    // OTP mail setup
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
      to: trimmedEmail,
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


export const otpVerification = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  console.log(req.body, "-------");

  try {
    const otpRecord = await OTPModel.findOne({ userMail: email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found for the provided email",
      });
    }

    if (otpRecord.otp !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Painter not found" });
    }

    user.isValid = true;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { username: user._id, role: 'user' },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    // Send token in cookie and response
    res.cookie("token", token, { httpOnly: true }).status(200).json({
      user: user,
      token,
      success: true,
      message: "User validated",
    });

    // Remove the extra response here
    // res.status(200).json({ success: true, message: "OTP verified successfully" });

  } catch (error: any) {
    console.log("Error at OTP verification:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mail4otp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

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
    const cleanedUsername = username.replace(/\s+/g, '').toLowerCase();
    const trimmedPassword = password.trim();

    const user = await userModel.findOne({ username: cleanedUsername });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Username not found" });
    }

    const isPasswordValid = await bcryptjs.compare(
      trimmedPassword,
      user?.password as string
    );

    if (!isPasswordValid) {
      return res  
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user._id, role: 'user' },
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

export const contactPage = async (req: Request, res: Response) => {
  const { name, mail, message } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  if (!mail) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(mail)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  try {
    await contactModel.create({ name, mail, message });
    res.status(200).json({ success: true, message: "Data added successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const getAllPost = async (req:Request, res:Response) => {
  try {
    const page = parseInt(req.query?.page as string || '1');
    const limit = parseInt(req.query?.limit as string || '2');
    
    const skip = (page - 1) * limit;

    const posts = await PostModel.find().sort({time:-1})
      .populate({ path: 'painterId', model: 'painter' })
      .skip(skip)
      .limit(limit);

    const totalPosts = await PostModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    console.log("post length",posts.length,"page number",page);
    

    res.status(200).json({ success: true, posts, totalPages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const updateLike = async (req: Request, res: Response) => {
  try {
    const { postId, userId } = req.body;

    let liked;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userIndex = post.likes.indexOf(userId);

    if (userIndex === -1) {
      post.likes.push(userId);
      liked = true;
    } else {
      post.likes.splice(userIndex, 1);
      liked = false;
    }

    await post.save();

    res.status(200).json({ success: true, message: "Like status updated successfully", post, liked });

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


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    const { postId, userId } = req.body;

    let reported;

    const post = await PostModel.findById(postId);    

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found", });
    }

    const userIndex = post.reportCount.indexOf(userId);    

    if (userIndex === -1) {
      post.reportCount.push(userId);
      reported = true;
    } else {
      post.reportCount.splice(userIndex, 1);
      reported = false;
    }

    
    if(post.reportCount.length >= 10){
      post.isDelete = true
    }
    
    

    await post.save();

    res.status(200).json({ success: true, message: "Like status updated successfully", post, reported });
  } catch (error) {
    console.error('Error handling report:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


///////////////////////////////////////////////////////////////////////////

export const searchPainters = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    let searchCriteria = {};
    let hashPost = [];

    if (name.startsWith('#')) {
      
      const searchVal = name.substring(1);
      const regexSearchVal = new RegExp(searchVal, 'i');
      
      hashPost = await PostModel.find({ specialised: regexSearchVal }).populate('painterId');
      
    } else {
      
      searchCriteria = {
        $or: [
          { username: { $regex: name, $options: 'i' } },
          { 'address.location': { $regex: name, $options: 'i' } }
        ]
      };

      const posts = await PostModel.find().populate({
        path: 'painterId',
        match: searchCriteria
      });

      hashPost = posts.filter(post => post.painterId !== null);

    }

    const filteredPostsByHash = hashPost.filter(post => post.painterId !== null);
    console.log(filteredPostsByHash,"******************");


    res.status(200).json({ success: true, posts: filteredPostsByHash });
  } catch (error) {
    console.error("Error searching painters:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




///////////////////////////////////////////////////////////////////////////


export const addAddress = async (req:Request,res:Response) => {
  try {
    const {address,phoneNo,userId} = req.body

    const newUserAddress = {
        houseNo: address.houseNo, 
        location: address.location, 
        pin: address.pin
    }
    const user:any = await userModel.findById(userId)

    user.address = newUserAddress;

const updatedUser = await userModel.findByIdAndUpdate(userId, { phone: phoneNo, address: user.address }, { new: true });
    if (!updatedUser) {
        throw new Error('User not found');
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    
  } catch (error) {
    console.log(error);
    
  }
}

///////////////////////////////////////////////////////////////////////////

export const ClientPainterProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const painter = await painterModel.findById(id);

    if (!painter) {
      return res.status(404).json({ message: "Painter not found" });
    }

    const posts = await PostModel.find({ painterId: painter._id });

    const slot = await SlotModel.find({painterId:id})

    

    return res.status(200).json({ message: "Painter data fetched successfully", painter, posts,slot });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


///////////////////////////////////////////////////////////////////////////


export const followPainter = async (req:Request, res:Response) => {
  try {
    
    const { painterId, userId } = req.body;    

    const painter = await painterModel.findById(painterId);

    if (!painter) {
      return res.status(404).json({ success: false, message: "Painter not found" });
    }
      

    painter.followers = painter.followers || [];

    let followed = false;

    if(painter.followers.includes(userId)){
      painter.followers = painter.followers.filter((followerId) => followerId !== userId);
    }else {
      painter.followers.push(userId);
      followed = true;
    }
    
    await painter.save();

    return res.status(200).json({success: true,followed});

  }catch (error) {
    console.error("Error updating follow status:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export const followerList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const painter = await painterModel.findById(id);

    if (!painter || !painter.followers) {
      return res.status(404).json({ message: 'Painter not found or no followers' });``
    }

    const followers = painter.followers;


    let followersList = [];
    
    for (let i = 0; i < followers.length; i++) {

      const followerId = followers[i];
      
      const user = await userModel.findById(followerId);


      if (user) {
        followersList.push(user);
      }

    }

    res.json(followersList);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




export const painterIndMsg = async (req: Request, res: Response) => {
  try {
    const { userId, painterId } = req.body;

    const convMembers: { _id: any } | null = await ConversationModel.findOne({ members: { $all: [userId, painterId] } });

    if (!convMembers) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const convId: string = convMembers._id.toString();

    const messageHistory = await MessageModel.find({ conversationId: convId });

    return res.status(200).json({ success: true, messageHistory });
      
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};



//////////////////////////////////////////////////////////////////////////////  


export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId, content, userId, painterId } = req.body;

    
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const user = await userModel.findById(userId)

    const id = new mongoose.Types.ObjectId(userId)

    const newComment = {
      text: content,
      userId: id,
      time: new Date(),
      userName:user?.username
    }; 
    
    post.comments.push(newComment);

    await post.save();

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//////////////////////////////////////////////////////////////////////////////  

export const changePassword = async (req:Request,res:Response) => {
  try {

    const {userId,newPassword} = req.body

    const hashedPass = bcryptjs.hashSync(newPassword, 2) as string;

    if (!hashedPass) {
      throw new Error("Password hashing failed");
    }
    
    const result = await userModel.findByIdAndUpdate(userId, {$set: {password:hashedPass}}, {new:true})    

    if(!result){
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Password updated successfully" });
    
  }catch (error) {

    console.error(error);
    res.status(500).send({ message: "Server error" })

  }
}


/////////////////////////////////////////////////////////////////////////////////////

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone, houseNo, location, pin, userId } = req.body;

    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updateData = {
      ...(name && { username: name }),
      ...(phone && { phone }),
      address: {
        ...(houseNo && { houseNo }),
        ...(location && { location }),
        ...(pin && { pin }),
      }
    };

    const result = await userModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: result });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/////////////////////////////////////////////////////////////////////////////////////

export const bookedSlot = async (req: Request, res: Response) => {
  try {

      const { userId, bookSlot, painterId } = req.body;
      const { date, slotId } = bookSlot;

      const newBooking = new bookingModel({
          date,
          painterId,
          userId,
      });

      const slot = await SlotModel.findByIdAndUpdate(slotId, { status: "booked" });

      if (!slot) {
          return res.status(404).json({ error: "There is no slot" });
      }

      await newBooking.save();

      const io = getIO();
      io.emit("slotBooked", { userId, bookSlot, painterId });

      res.status(201).json({ message: "Booking successful", booking: newBooking, slot });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
  }
};

///////////////////////////////////////////////////////////

export const getHashtags = async (req: Request, res: Response) => {
  try {
    const painters = await painterModel.find();
    console.log(painters,"===============");
    
    res.status(200).json({ success: true, painters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};