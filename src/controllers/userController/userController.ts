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


export const signup = async (req: Request, res: Response, next: NextFunction) => {
  // console.log("inside the user signup");

  const { username, email, password } = req.body;

  // Remove all whitespace from username, convert to lowercase, and trim whitespace from email and password
  const cleanedUsername = username.replace(/\s+/g, '').toLowerCase();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  // console.log(req.body, "Body from painter controller");

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

    // Return success response
    // res.status(200).json({ success: true, message: "OTP verified successfully" });
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
    // console.log("inside the resend otp");
    // console.log(req.body, "inside the resend otp api");

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
    // console.log("entering");
    
    // Convert username to lowercase and remove all whitespace
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


// export const getAllPost = async(req:Request,res:Response) => {
  
//   try {    
//     const post = await PostModel.find().populate("painterId")
//     res.status(200).json({success:true,post})
//   } catch (error) {
//    console.log(error);
//   }
// }

export const getAllPost = async (req:Request, res:Response) => {
  try {
    const page = parseInt(req.query?.page as string || '1');
    const limit = parseInt(req.query?.limit as string || '2');
    
    const skip = (page - 1) * limit;

    const posts = await PostModel.find()
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




// export const getAllPost = async (req: Request, res: Response) => {
//   const { page = 1, limit = 10 } = req.query;

//   // Convert query parameters to numbers
//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (isNaN(pageNumber) || isNaN(limitNumber)) {
//     return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
//   }

//   try {
//     const posts = await PostModel.find()
//       .skip((pageNumber - 1) * limitNumber)
//       .limit(limitNumber)
//       .populate("painterId");

//     res.status(200).json({ success: true, posts });
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const updateLike = async (req: Request, res: Response) => {
  console.log("like in the userside");

  try {
    const { postId, userId } = req.body;

    // console.log("postId =>",postId,"UserID=>",userId, "------------------------------------------");
    
    let reported;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userIndex = post.likes.indexOf(userId);

    // console.log(userIndex,"------------------------------------------");
    

    if (userIndex === -1) {
      post.likes.push(userId);
      reported = true;
    } else {
      post.likes.splice(userIndex, 1);
      reported = false;
    }

    // console.log(post.likes,"post.like------------------------------------------");
    

    await post.save();

    res.status(200).json({ success: true, message: "Like status updated successfully", post, reported });

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

    // console.log("postId =>",postId,"UserID=>",userId, "------------------------------------------");
    
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

    // const Name = new RegExp(name,'i')

    
    const posts = await PostModel.find().populate({
      path: 'painterId',
      match: {
        $or: [
          { username: { $regex: name, $options: 'i' } },
          { location: { $regex: name, $options: 'i' } }
        ]
      }
    });

    // console.log(posts,"from the search");
    
    

    const filteredPosts=posts.filter(post=>post.painterId!==null)

    // console.log(filteredPosts,"ppppppppppppppppppppppppppp");
    
    

    res.status(200).json({ success: true, filteredPosts});
  } catch (error) {
    console.error("Error searching painters:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


///////////////////////////////////////////////////////////////////////////


export const addAddress = async (req:Request,res:Response) => {
  try {
    // console.log(req.body,";;;;;;;;;;;;;;;;;;;;;;;99999");
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

const updatedUser = await userModel.findByIdAndUpdate(userId, { phone: phoneNo, address: user.address }, { new: true });
// console.log(updatedUser,"user")
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
    // console.log(posts, "=======posts");

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
    // const user = await userModel.findById(userId)

    if (!painter) {
      return res.status(404).json({ success: false, message: "Painter not found" });
    }

    // if(!user){
    //   return res.status(404).json({ success: false, message: "User not found" });
    // }
      

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
      return res.status(404).json({ message: 'Painter not found or no followers' });
    }

    const followers = painter.followers;

    // console.log(followers,"================ here is the id");
    

    let followersList = [];
    
    for (let i = 0; i < followers.length; i++) {

      const followerId = followers[i];
      
      const user = await userModel.findById(followerId);

      // console.log(followersList,"+++++++++++++++++++++++++++++++++++++++++++");
      


      if (user) {
        followersList.push(user); // Assuming username is a field in your userModel
      }

      // console.log(followersList,"----------------------------");
      
    }

    res.json(followersList);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




export const painterIndMsg = async (req:Request,res:Response) => {
  try {

    const {userId,painterId} = req.body

    const convMembers = await ConversationModel.findOne({members: { $all: [userId, painterId] }})

    const convId:string =  convMembers?._id.toString()

    const messageHistory = await MessageModel.find({conversationId:convId}) 

    return  res.status(200).json({success: true,messageHistory});
      
  } catch (error) {
    
    console.log(error);
    
  }
}


//////////////////////////////////////////////////////////////////////////////  


export const createComment = async (req: Request, res: Response) => {
  try {
    // console.log(req.body, "===========================================");

    const { postId, content, userId, painterId } = req.body;

    
    // Find the post by postId
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const user = await userModel.findById(userId)

    // Create the new comment
    const id = new mongoose.Types.ObjectId(userId)

    // console.log(req.body,"999999999999999999999999999");
    


    const newComment = {
      text: content,
      userId: id,
      time: new Date(),
      userName:user?.username
    }; 
    
    // Push the new comment into the comments array
    post.comments.push(newComment);

    // Save the updated post
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

    // console.log(result,"===");
    

    if(!result){
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Password updated successfully" });
    
  } catch (error) {
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

    // console.log(result,"---------");
    
    
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
      const { start, end, date, slotId } = bookSlot;

      const newBooking = new bookingModel({
          date,
          start,
          end,
          painterId,
          userId,
      });

      const slot = await SlotModel.findByIdAndUpdate(slotId, { status: "booked" });

      if (!slot) {
          return res.status(404).json({ error: "There is no slot" });
      }

      await newBooking.save();

      // Emit the booking event
      const io = getIO();
      io.emit("slotBooked", { userId, bookSlot, painterId });

      res.status(201).json({ message: "Booking successful", booking: newBooking, slot });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
  }
};

///////////////////////////////////////////////////////////