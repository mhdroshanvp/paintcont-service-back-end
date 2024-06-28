"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default('sk_test_51PR6LO2NwOt8OZa3IUqvjjOt5bvDwi77fxyfttn9LsQN3PrxvgBkoyMoCf7L8SgrPcmcyY6fZyIyEkmOYnFl73SI00Z2lKtCb5');
exports.default = stripe;
//# sourceMappingURL=stripeConfig.js.map