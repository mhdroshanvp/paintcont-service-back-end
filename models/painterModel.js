"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const painterSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    profile: String,
    phone: {
        type: String,
    },
    address: {
        country: String,
        state: String,
        city: String
    },
    age: {
        type: Number,
    },
    experienceYears: {
        type: Number,
    },
    specialised: {
        type: [String],
        default: []
    },
    description: String,
    aboutMe: String,
    premium: {
        type: Boolean,
        default: false,
    },
    premiumEndingDate: Date,
    isValid: {
        type: Boolean,
        default: false
    },
    followers: {
        type: [String],
        default: []
    },
    location: { type: String }
});
const painterModel = (0, mongoose_1.model)("painter", painterSchema);
exports.default = painterModel;
//# sourceMappingURL=painterModel.js.map