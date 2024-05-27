import express from "express";
import { createPost, otpVerification, painterLogin, painterProfile, resendOTP, signup, updatePainterDetails } from "../../controllers/painterController/painterController";
import { userProfile } from "../../controllers/userController/userController";
import { verifyUser } from "../../utils/verifyUser";


const router = express.Router()

router.post('/signup',signup)
router.post('/otp', otpVerification)
router.post('/otp/resend',resendOTP)
router.post('/login',painterLogin)
router.post('/create-post',createPost)
router.get('/add-address',userProfile)
router.get('/profile/:id',painterProfile)
router.post('/update-profile/:id', updatePainterDetails);

export default router;
