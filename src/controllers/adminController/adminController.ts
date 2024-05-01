import { NextFunction, Request, Response } from "express";
import { AdminInterface } from "../../Interfaces/adminInterface/adminInterface";
import adminModel from "../../models/adminModel";
import { STATUS_CODES, ERR_MESSAGE } from "../../constants/httpStatusCode";
import { cutomError } from "../../Interfaces/customError";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel";
import painterModel from "../../models/painterModel";


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
      console.log("here");
      console.log(user, "<<<<<<<<<<>>>>>>>>>>>>");

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
    console.log(userId);

    const user = await userModel.findById(userId);
    console.log(user, "user");

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