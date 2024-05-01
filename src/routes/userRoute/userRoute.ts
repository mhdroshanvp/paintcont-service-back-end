import express, { Request, Response } from "express";
import { getAllPost, handleReport, mail4otp, otpVerification, resendOTP, signup, updateLike, userLogin, userProfile } from "../../controllers/userController/userController";


const router = express.Router()

router.post('/signup',signup)
router.post('/otp', otpVerification)
router.post('/otp/resend',resendOTP)
router.post('/mail4otp',mail4otp)
router.post('/login',userLogin)
router.get('/getAllPost',getAllPost)
router.post('/update-like',updateLike)
router.get('/profile/:id',userProfile)
router.post('/report',handleReport)
// router.post('/report',(req: Request, res: Response) => {
//     console.log('jjjjjjjjjjjjjjjjjjjj')
// })



export default router