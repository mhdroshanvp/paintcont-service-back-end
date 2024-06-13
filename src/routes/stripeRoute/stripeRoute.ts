import express from "express";
import { payment} from "../../controllers/stripeController/stripeController";

const router = express.Router()

router.post("/create-checkout-session",payment)
// router.post("/webhook",PaymentSuccess)

export default router;
