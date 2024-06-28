"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payment = void 0;
const stripeConfig_1 = __importDefault(require("../../Config/stripeConfig"));
const slots_1 = __importDefault(require("../../models/slots"));
const paymentModel_1 = __importDefault(require("../../models/paymentModel"));
const payment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, slot } = req.body;
        if (!slot || slot.length === 0) {
            return res.status(400).json({ message: "Slot information is missing" });
        }
        const slotId = slot[0]._id;
        const Slot = yield slots_1.default.findById(slotId);
        if (!Slot) {
            return res.status(404).json({ message: "Slot not found" });
        }
        if (Slot.amount) {
            const session = yield stripeConfig_1.default.checkout.sessions.create({
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
                success_url: 'http://localhost:5173/user/payment-success',
                cancel_url: 'http://localhost:5173/user/home',
                billing_address_collection: 'required',
            });
            const paymentData = new paymentModel_1.default({
                userId: userId,
                painterId: Slot.painterId,
                amount: Slot.amount,
                paymentId: session.id,
            });
            const savedPayment = yield paymentData.save();
            let save = false;
            if (savedPayment) {
                save = true;
            }
            res.json({ id: session.id, save });
        }
        else {
            res.status(400).json({ message: "Slot amount is missing" });
        }
    }
    catch (error) {
        console.error("Error during payment processing:", error);
        res.status(500).send('Internal Server Error');
    }
});
exports.payment = payment;
///////////////////////////////////////////////////////////////////////
// export const PaymentSuccess = async (req:Request,res:Response) => {
//     try {
//     const payload = req.body;
//     const paymentIntentId = payload?.data?.object?.payment_intent
//     const payloadString = JSON.stringify(payload, null, 2);
//     const sig = req.headers["stripe-signature"];
//     if (typeof sig !== "string") {
//       return false;
//     }
//     const endpointSecret =
//       "whsec_a7be1903b259a26cf9cdb08b8c301a8825af2e813bbd9c4668c21d922e970601";
//     const header = stripe.webhooks.generateTestHeaderString({
//       payload: payloadString,
//       secret: endpointSecret,
//     });
//     let event;
//     event = stripe.webhooks.constructEvent(
//       payloadString,
//       header,
//       endpointSecret
//     );
//     const paymentIntentResponse = await stripe.paymentIntents.retrieve(paymentIntentId);
//     if (paymentIntentId) {
//       const paymentIntent = paymentIntentResponse
//       if (paymentIntentResponse.latest_charge) {
//         const chargeId = paymentIntentResponse.latest_charge;
//         req.app.locals.chargeId = chargeId;
//       } else {
//         return null;
//       }
//     }
//     if (event.type == "checkout.session.completed") {
//     } else {
//       return false;
//     }
//     }catch (error) {
//         console.log(error);
//     }
//   }
//# sourceMappingURL=stripeController.js.map