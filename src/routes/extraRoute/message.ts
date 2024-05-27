import express from "express";
import MessageModel from "../../models/message";

const router = express.Router()

//new conv

router.post("/", async (req,res)=>{
    const newMessage = new MessageModel(req.body)

    try {
        const savedMessage = await newMessage.save()
        res.status(200).json(savedMessage)
    } catch (error) {
        res.status(500).json(error)
    }
})

//get conv of a user
router.get("/:conversationId", async (req,res)=>{
    try {
        const messages = await MessageModel.find({
            conversationId:req.params.conversationId
        })
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error)
    }
})

export default router;