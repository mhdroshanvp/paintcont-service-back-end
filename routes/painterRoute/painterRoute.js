"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const painterController_1 = require("../../controllers/painterController/painterController");
const router = express_1.default.Router();
router.post('/signup', painterController_1.signup);
router.post('/otp', painterController_1.otpVerification);
router.post('/otp/resend', painterController_1.resendOTP);
router.post('/login', painterController_1.painterLogin);
router.post('/create-post', painterController_1.createPost);
router.get('/profile/:id', painterController_1.painterProfile);
router.post('/update-profile/:id', painterController_1.updatePainterDetails);
router.post('/create-slot/:painterId', painterController_1.createSlot);
router.delete('/delete-post/:postId', painterController_1.deletePost);
exports.default = router;
//# sourceMappingURL=painterRoute.js.map