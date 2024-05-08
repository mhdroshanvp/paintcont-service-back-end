import express, { Request, Response } from "express";
import { addAddress, getAllPost, handleReport, mail4otp, otpVerification, resendOTP, searchPainters, signup, updateLike, userLogin, userProfile } from "../../controllers/userController/userController";
import { searchForWorkspaceRoot } from "vite";


const router = express.Router()

router.post('/signup',signup)
router.post('/otp', otpVerification)
router.post('/otp/resend',resendOTP)
router.post('/mail4otp',mail4otp)
router.post('/login',userLogin)
router.get('/getAllPost',getAllPost)
router.post('/update-like',updateLike)
router.post('/report',handleReport)
router.post('/search', searchPainters);
router.get('/profile/:id',userProfile)
router.put('/add-address',addAddress)



export default router