import express from "express";
import { createPost, createSlot, deletePost, otpVerification, painterDashboard, painterLogin, painterProfile, resendOTP, signup, updatePainterDetails } from "../../controllers/painterController/painterController";
import { verifyUser } from "../../utils/verifyUser";


const router = express.Router()

router.post('/signup',signup)
router.post('/otp', otpVerification)
router.post('/otp/resend',resendOTP)
router.post('/login',painterLogin)
router.post('/create-post',createPost)
router.get('/profile/:id',painterProfile)
router.post('/update-profile/:id', updatePainterDetails);
router.post('/create-slot/:painterId',createSlot);
router.delete('/delete-post/:postId',deletePost)
router.get('/dashboard',painterDashboard)

export default router;
