import express from "express";
import { adminPainter, adminUser, dashboard, deletePost, getDeletedPosts, graph1, isBlocked, isBlockedPainter, login } from "../../controllers/adminController/adminController";

const router = express.Router()

router.post('/login',login)

router.get('/user',adminUser)

router.get('/painter',adminPainter)

router.patch('/user/isBlocked/:id',isBlocked)

router.patch('/painter/isBlocked/:id',isBlockedPainter)

router.get('/posts',getDeletedPosts)

router.delete('/painter/posts/deletePost/:id', deletePost);

router.post('/dashboard',dashboard)

router.post('/dashboard/graph1',graph1)

export default router;