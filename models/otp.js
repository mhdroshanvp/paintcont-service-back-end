"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OTPSchema = new mongoose_1.Schema({
    userMail: {
        type: String,
    },
    otp: {
        type: Number
    },
    exp: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000)
    }
});
OTPSchema.index({ exp: 1 }, { expireAfterSeconds: 0 });
const OTPModel = (0, mongoose_1.model)("otp", OTPSchema);
exports.default = OTPModel;
//# sourceMappingURL=otp.js.map