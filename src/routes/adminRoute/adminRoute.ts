import express from "express";
import { adminPainter, adminUser, isBlocked, isBlockedPainter, login } from "../../controllers/adminController/adminController";

const router = express.Router()

router.post('/login',login)
router.get('/user',adminUser)
router.get('/painter',adminPainter)
router.patch('/user/isBlocked/:id',isBlocked)
router.patch('/painter/isBlocked/:id',isBlockedPainter)

export default router;