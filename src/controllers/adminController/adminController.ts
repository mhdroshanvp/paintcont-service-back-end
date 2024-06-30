import { NextFunction, Request, Response } from "express";
import { AdminInterface } from "../../Interfaces/adminInterface/adminInterface";
import adminModel from "../../models/adminModel";
import { STATUS_CODES, ERR_MESSAGE } from "../../constants/httpStatusCode";
import { cutomError } from "../../Interfaces/customError";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel";
import painterModel from "../../models/painterModel";
import PostModel from "../../models/postModels";


////////////////////////////////////////////////////////////

export const login = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  adminModel.findOne({ username })
    .then((validAdmin) => {
      if (!validAdmin) {
        const error: cutomError = {
          StatusCode: STATUS_CODES.NOT_FOUND.toString(),
          message: ERR_MESSAGE[STATUS_CODES.NOT_FOUND],
        };
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ success: false, message: error.message });
      }

      if (validAdmin && validAdmin.password !== password) {
        return res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ success: false, message: "Incorrect password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { username: validAdmin.username, role: "admin" },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      // Send token in cookie
      res
        .cookie("admin_token", token, { httpOnly: true })
        .status(STATUS_CODES.OK)
        .json({
          user: validAdmin,
          token,
          success: true,
          message: "User validated",
        });
    })
    .catch((error) => {
      console.error(error);
      next(error);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
    });
};


////////////////////////////////////////////////////////////


export const adminUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  userModel
    .find()
    .then((user) => {

      if (!user) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: ERR_MESSAGE[STATUS_CODES.FORBIDDEN],
        });
      }

      res
        .status(STATUS_CODES.OK)
        .json({
          success: true,
          message: "user list fetched successfully",
          user,
        });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR],
        });
    });
};


////////////////////////////////////////////////////////////


export const isBlocked = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.NOT_FOUND] });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(STATUS_CODES.OK).json({ success: true, message: "success" });
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};


////////////////////////////////////////////////////////////

export const adminPainter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  painterModel
    .find()
    .then((painter) => {
      if (!painter) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.NOT_FOUND] });
      }

      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: "user list fetched successfully", painter });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
    });
};



////////////////////////////////////////////////////////////

export const isBlockedPainter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const painterId = req.params.id;
    
    const painter = await painterModel.findById(painterId);
    
    if (!painter) {
      return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.NOT_FOUND] });
    }
    
    painter.isBlocked = !painter.isBlocked;
    await painter.save();
    
    res.status(STATUS_CODES.OK).json({ success: true, message: "success" });
  } catch (error) {
    console.log(error);
    res
    .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};


//////////////////////////////////////////////////////////// 

export const getDeletedPosts = async (req: Request, res: Response) => {
  try {

    const deletedPosts = await PostModel.find({ isDelete: true });

    if (!deletedPosts.length) {
      return res.status(404).json({ success: false, message: "No deleted posts found" });
    }

    res.status(200).json({ success: true, posts: deletedPosts });
  } catch (error) {
    console.error('Error fetching deleted posts:', error);
    res.status(500).json({ success: false, message: ERR_MESSAGE[STATUS_CODES.INTERNAL_SERVER_ERROR] });
  }
};

//////////////////////////////////////////////////////////// 

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;

    // console.log("I'm here");
    // console.log(postId, "are you there...!?");

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


//////////////////////////////////////////////////////////// 

export const dashboard = async (req:Request,res:Response) => {
  try {
    
    const user = await userModel.find()
    const painter = await painterModel.find()
    
    const blockedUser = await userModel.find({isBlocked:true})
    const blockedPainter = await painterModel.find({isBlocked:true})
    
    if (!user) {
      return res.status(404).json({ success: false, message: "There is no user" });
    }
    
    if (!painter) {
      return res.status(404).json({ success: false, message: "There is no painter" });
    }
    
    return res.status(200).json({ message: "Data fetched successfully", user,painter,blockedUser,blockedPainter });
    
  } catch (error) {
    console.log(error);
  }
}

//////////////////////////////////////////////////////////// 

export const graph1 = async (req: Request, res: Response) => {
  try {
    
    const posts = await PostModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, 
    ]);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ success: false, message: "There are no posts" });
    }

    return res.status(200).json({ success: true, message: "Data fetched successfully", posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
