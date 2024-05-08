import express from "express";
import { createPost, getAllPost, otpVerification, painterLogin, painterProfile, resendOTP, signup } from "../../controllers/painterController/painterController";
import { userProfile } from "../../controllers/userController/userController";


const router = express.Router()

router.post('/signup',signup)
router.post('/otp', otpVerification)
router.post('/otp/resend',resendOTP)
router.post('/login',painterLogin)
router.post('/create-post',createPost)
router.get('/getAllPost',getAllPost)
router.get('/add-address',userProfile)
router.get('/profile/:id',painterProfile)


export default router;