import express from "express";
import { login } from "../../controllers/adminController/adminController";

const   router = express.Router()

router.post('/login',login)

export default router;