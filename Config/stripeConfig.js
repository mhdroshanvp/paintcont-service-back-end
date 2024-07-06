"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default('sk_test_51PZThc2LBBR2nOfKO77VL59K9kx7aSgoJBWRWKCZ3wYllE5yfWr9yia58j7IJ7TYmXEKcYIyq9oLBxmslA8egQ4H00TBf7w0W5');
exports.default = stripe;
//# sourceMappingURL=stripeConfig.js.map