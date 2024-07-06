import express from "express";
import { createPost, createSlot, deletePost, deleteSlot, editSlot, fetchpainter, otpVerification, painterDashboard, painterLogin, painterProfile, resendOTP, signup, updatePainterDetails } from "../../controllers/painterController/painterController";
import { verifyUser } from "../../utils/verifyUser";
import { verifyPainter } from "../../utils/verifyPainter";


const router = express.Router()

router.post('/signup',signup)
router.post('/otp', otpVerification)
router.post('/otp/resend',resendOTP)
router.post('/login',painterLogin)
router.post('/create-post',verifyPainter,createPost)
router.get('/profile/:id',verifyPainter,painterProfile)
router.post('/update-profile/:id',verifyPainter, updatePainterDetails);
router.post('/create-slot/:painterId',verifyPainter,createSlot);
router.put('/slots/:slotId',verifyPainter,editSlot);
router.delete('/slots/:slotId',verifyPainter, deleteSlot); 
router.delete('/delete-post/:postId',verifyPainter,deletePost)
router.get('/dashboard',verifyPainter,painterDashboard)
router.get('/blockornot',verifyPainter)
router.get('/fetchpainter/:id',fetchpainter)

export default router;
