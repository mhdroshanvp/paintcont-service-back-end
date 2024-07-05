import express from "express";
import { adminPainter, adminUser, dashboard, deletePost, getDeletedPosts, graph1, isBlocked, isBlockedPainter, login } from "../../controllers/adminController/adminController";
import { verifyAdmin } from "../../utils/verifyAdmin";

const router = express.Router()

router.post('/login',login)

router.get('/user',verifyAdmin,adminUser)

router.get('/painter',verifyAdmin,adminPainter)

router.patch('/user/isBlocked/:id',verifyAdmin,isBlocked)

router.patch('/painter/isBlocked/:id',verifyAdmin,isBlockedPainter)

router.get('/posts',verifyAdmin,getDeletedPosts)

router.delete('/painter/posts/deletePost/:id',verifyAdmin, deletePost);

router.post('/dashboard',verifyAdmin,dashboard)

router.post('/dashboard/graph1',verifyAdmin,graph1)

export default router;