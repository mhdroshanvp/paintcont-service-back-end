import express, { Request, Response } from "express";
import {
  ClientPainterProfile, addAddress, changePassword, createComment, followPainter, followerList, getAllPost,
  handleReport, mail4otp, otpVerification, painterIndMsg, resendOTP, searchPainters,
  signup, updateLike, updateUserProfile, userLogin, userProfile } from "../../controllers/userController/userController";
import { verifyUser } from "../../utils/verifyUser";

const router = express.Router(); 

router.post("/signup", signup);
router.post("/login", userLogin);
router.post("/otp", otpVerification);
router.post("/otp/resend", resendOTP);
router.post("/mail4otp", mail4otp);
router.get("/getAllPost", verifyUser, getAllPost);
router.post("/update-like", verifyUser, updateLike);
router.post("/report", verifyUser, handleReport);
router.post("/search", verifyUser, searchPainters);
router.get("/profile/:id", verifyUser, userProfile);
router.patch("/add-address", verifyUser, addAddress);
router.get("/painter/profile/:id", verifyUser, ClientPainterProfile);
router.post("/followPainter", verifyUser, followPainter);
router.get("/painter/profile/followerList/:id", verifyUser, followerList);
router.post("/painter/profile/indMsg", verifyUser, painterIndMsg);
router.post("/post/comments", verifyUser,createComment);
router.patch("/profile/change-password",verifyUser,changePassword)
router.put("/profile/updateUserProfile",verifyUser,updateUserProfile)


export default router;