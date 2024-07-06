// paymentController.ts
import { Request, Response } from 'express';
import stripe from '../../Config/stripeConfig'; 
import SlotModel from '../../models/slots'; 
import paymentModel from '../../models/paymentModel';
import bookingModel from '../../models/BookingModel';



export const payment = async (req: Request, res: Response) => {
    try {
  
      const { userId, slot } = req.body;
      req.app.locals.slot=slot
      req.app.locals.userId= userId
  
      if (!slot || slot.length === 0) {
        return res.status(400).json({ message: "Slot information is missing" });
      }
  
      const slotId = slot[0]._id;
  
      const Slot = await SlotModel.findById(slotId);
  
      if (!Slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
  
      if (Slot.amount) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Slot booking for ${Slot.date}`,
              },
              unit_amount: Slot.amount * 100,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: 'https://paintcont.vercel.app/user/payment-success', 
          // success_url: 'http://localhost:5173/user/payment-success', 
          cancel_url: 'https://paintcont.vercel.app/user/payment-failure',
          billing_address_collection: 'required',
        });
  
        // const paymentData = new paymentModel({
        //   userId: userId,
        //   painterId: Slot.painterId,
        //   amount: Slot.amount,
        //   paymentId: session.id, 
        // });
  
        // const savedPayment = await paymentData.save();

        // let save = false

        // if(savedPayment){
        //     save = true
        // }
        req.app.locals.sessionId= session.id
        res.json({ id: session.id});
        
      } else {
        res.status(400).json({ message: "Slot amount is missing" });
      }
    } catch (error) {
      console.error("Error during payment processing:", error);
      res.status(500).send('Internal Server Error');
    }
  };
  

///////////////////////////////////////////////////////////////////////


export const PaymentSuccess = async (req:Request,res:Response) => {
    
    try {
      const slot= req.app.locals.slot
      const userId= req.app.locals.userId
      const sessionId= req.app.locals.sessionId
      if (!slot) {
        return res.status(400).json({ message: "Slot information is missing" });
      }
      
      const slotId = slot[0]._id;
      
      const Slot = await SlotModel.findById(slotId);
      
      if (!Slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
      const payload = req.body;
      const paymentIntentId = payload?.data?.object?.payment_intent
      const payloadString = JSON.stringify(payload, null, 2);
      const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string") {
      return false;
    }
    
    const endpointSecret =
      "whsec_23411f610b1fee843ac16f80f3e28f4151ecd513b4d61356eaf65e711966939a";
    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: endpointSecret,
    });

    let event;

    event = stripe.webhooks.constructEvent(
      payloadString,
      header,
      endpointSecret
    );

    const paymentIntentResponse = await stripe.paymentIntents.retrieve(paymentIntentId);


    if (paymentIntentId) {
      const paymentIntent = paymentIntentResponse
      if (paymentIntentResponse.latest_charge) {
        const chargeId = paymentIntentResponse.latest_charge;
        req.app.locals.chargeId = chargeId;
      } else {
        return null;
      }
    }
    if (event.type == "checkout.session.completed") {
          const paymentData = new paymentModel({
          userId: userId,
          painterId: Slot.painterId,
          amount: Slot.amount,
          paymentId: sessionId, 
        });
  
        const savedPayment = await paymentData.save();

        const slotBooked = await SlotModel.findByIdAndUpdate({_id:slotId},{$set:{status:"booked"}}) 

        console.log(slotBooked);
        

        const newBooking = new bookingModel({
          date:new Date(),
          painterId:Slot.painterId,
          userId,
      });

      await newBooking.save();


    } else {
      return false;
    }
    }catch (error) {
        console.log(error);
            
    }

  }