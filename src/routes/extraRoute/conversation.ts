import express from "express";
import ConversationModel from "../../models/conversations"; // Adjust the import path
import painterModel from "../../models/painterModel";
import userModel from "../../models/userModel";

const router = express.Router();

// New conversation
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;
  console.log(req.body);
 
  try {
  const conversation = await ConversationModel.find({
    members: {$in : [senderId]},
}) 

const conversatioNew = await ConversationModel.find({
  members: {$all : [senderId,receiverId]},
}) 
    if(!conversatioNew.length){

   
      if (!senderId || !receiverId) {
        return res.status(400).json({ message: "SenderId and ReceiverId are required" });
      }
      
  const newConversation = new ConversationModel({
    members: [senderId, receiverId],
  });
  
  


  console.log(
    'pppppppppppp'
  );
  

    const savedConversation = await newConversation.save();
    conversation.push(savedConversation)
}
  
const data = await Promise.all(conversation.map(async (i:any) => {
  try {
    const obj = {...i}._doc
    const data = await painterModel.findById(i.members[1]);
    const data1 = await userModel.findById(i.members[0]);
    obj.painterName = data || null
    obj.userName= data1 || null
    console.log("-------",obj)
      return obj
  } catch (error) {
    console.error(`Error fetching painter name: ${error}`);
    return i;
  }
}));

console.log(data)
res.status(200).json(data)

  } catch (error) {
    res.status(500).json(error);
  }
});

// Get conversations of a user
// Add your other routes here

router.get('/:userId',async (req,res) => {
    try {
        const conversation = await ConversationModel.find({
            members: {$in : [req.params.userId]},
        }) 
        const data = await Promise.all(conversation.map(async (i:any) => {
          try {
            const obj = {...i}._doc
            const data = await painterModel.findById(i.members[1]);
            const data1 = await userModel.findById(i.members[0]);
            obj.painterName = data || null
            obj.userName= data1 || null
            console.log("-------",obj)
              return obj
          } catch (error) {
            console.error(`Error fetching painter name: ${error}`);
            return i;
          }
        }));
        
        console.log(data)
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error)
    }
})

export default router;
