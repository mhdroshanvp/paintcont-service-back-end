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
exports.deletePost = exports.createSlot = exports.updatePainterDetails = exports.painterProfile = exports.createPost = exports.painterLogin = exports.resendOTP = exports.otpVerification = exports.signup = void 0;
const painterModel_1 = __importDefault(require("../../models/painterModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_1 = __importDefault(require("../../models/otp"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postModels_1 = __importDefault(require("../../models/postModels"));
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const axios_1 = __importDefault(require("axios"));
const slots_1 = __importDefault(require("../../models/slots"));
////////////////////////////////////////////////////////////
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const existingPainter = yield painterModel_1.default.findOne({ username });
        const existingEmail = yield painterModel_1.default.findOne({ email });
        if (existingPainter) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.CONFLICT)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.CONFLICT] });
        }
        if (existingEmail) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.CONFLICT)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.CONFLICT] });
        }
        //OTP generation
        const generatedOTP = Math.floor(100000 + Math.random() * 900000);
        //Password hashing
        const hashedPass = bcryptjs_1.default.hashSync(password, 2);
        if (!hashedPass) {
            throw new Error(httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR]);
        }
        if (!password) {
            throw new Error('Password is missing');
        }
        const newPainter = new painterModel_1.default({
            username,
            email,
            password: hashedPass,
            otpCode: generatedOTP,
            isValid: false,
        });
        yield newPainter.save();
        const otpData = new otp_1.default({
            userMail: email,
            otp: generatedOTP,
        });
        yield otpData.save();
        //OTP mail setup
        console.log("Generated OTP is:", generatedOTP);
        const transporter = nodemailer_1.default.createTransport({
            service: "Gmail",
            auth: {
                user: "paintcont.services@gmail.com",
                pass: "aexsubfytrfhhwcp",
            },
        });
        // Mail options
        const mailOptions = {
            from: "paintcont.services@gmail.com",
            to: req.body.email,
            subject: "OTP Verification",
            text: `Your OTP for verification of Paintcont is: ${generatedOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.paintcont.com`,
        };
        // Send OTP via email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res
                    .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
            }
            else {
                return res
                    .status(httpStatusCode_1.STATUS_CODES.OK)
                    .json({ success: true, message: "OTP sent successfully" });
            }
        });
    }
    catch (error) {
        console.log("Error at painter signup:", error);
        if (error.code === 11000) {
            const keyValue = error.keyValue;
            return res
                .status(httpStatusCode_1.STATUS_CODES.CONFLICT)
                .json({ success: false, message: `${keyValue} already exists` });
        }
        return res
            .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    }
});
exports.signup = signup;
////////////////////////////////////////////////////////////
const otpVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const otpRecord = yield otp_1.default.findOne({ userMail: email });
        // Compare the provided OTP with the OTP stored in the database
        if ((otpRecord === null || otpRecord === void 0 ? void 0 : otpRecord.otp) !== parseInt(otp)) {
            return res.status(httpStatusCode_1.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.BAD_REQUEST],
            });
        }
        // If OTP is valid, update the user's validity status in the database
        const painter = yield painterModel_1.default.findOne({ email });
        if (painter) {
            painter.isValid = true;
            yield painter.save();
        }
        else {
            return res.status(httpStatusCode_1.STATUS_CODES.NOT_FOUND).json({ success: false, message: "Painter not found" });
        }
        res.status(httpStatusCode_1.STATUS_CODES.OK).json({ success: true, message: "OTP verified successfully" });
    }
    catch (error) {
        console.log("Error at OTP verification:", error);
        res.status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    }
});
exports.otpVerification = otpVerification;
////////////////////////////////////////////////////////////
const resendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Generate new OTP
        const newOTP = Math.floor(100000 + Math.random() * 900000);
        const existedOTP = yield otp_1.default.findOne({ userMail: email });
        if (existedOTP) {
            yield otp_1.default.deleteOne({ userMail: email });
        }
        const otpRecord = yield otp_1.default.create({
            userMail: email,
            otp: newOTP,
            new: true,
        });
        // Send new OTP via email
        const transporter = nodemailer_1.default.createTransport({
            service: "Gmail",
            auth: {
                user: "paintcont.services@gmail.com",
                pass: "aexsubfytrfhhwcp",
            },
        });
        const mailOptions = {
            from: "paintcont.services@gmail.com",
            to: email,
            subject: "New OTP Verification",
            text: `Your new OTP for verification of Paintcont is: ${newOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.paintcont.com`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res
                    .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
            }
            else {
                console.log("New OTP sent:------", newOTP);
                res.status(httpStatusCode_1.STATUS_CODES.OK).json({ success: true, message: "New OTP sent successfully" });
            }
        });
    }
    catch (error) {
        console.log("Error in resend OTP:", error.message);
        res.status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    }
});
exports.resendOTP = resendOTP;
////////////////////////////////////////////////////////////
const painterLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const painter = yield painterModel_1.default.findOne({ username });
        if (!painter) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.NOT_FOUND)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.NOT_FOUND] });
        }
        if (painter.isBlocked == true) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.FORBIDDEN)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.FORBIDDEN] });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, painter === null || painter === void 0 ? void 0 : painter.password);
        if (!isPasswordValid) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.UNAUTHORIZED)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.UNAUTHORIZED] });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ username: painter._id, role: 'painter' }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });
        // Send token in cookie
        res.cookie("painter_token", token, { httpOnly: true }).status(httpStatusCode_1.STATUS_CODES.OK).json({
            user: painter,
            token,
            success: true,
            message: "Painter validated",
        });
    }
    catch (error) {
        console.log("Error in painter login:", error.message);
        return res
            .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    }
});
exports.painterLogin = painterLogin;
////////////////////////////////////////////////////////////
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { painterId, imageUrl, description, specialised } = req.body.data;
        const response = yield axios_1.default.head(imageUrl);
        if (!response.headers['content-type'].startsWith('image/')) {
            return res.status(400).json({ error: 'Invalid image URL' });
        }
        const newPost = new postModels_1.default({
            painterId: painterId,
            media: imageUrl,
            description: description,
            specialised: specialised,
        });
        yield newPost.save();
        res.status(201).json({ message: 'Post created successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.createPost = createPost;
////////////////////////////////////////////////////////////
const painterProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const painter = yield painterModel_1.default.findById(id);
        if (!painter) {
            return res.status(404).json({ message: "Painter not found" });
        }
        const posts = yield postModels_1.default.find({ painterId: painter._id });
        return res.status(200).json({
            message: "Painter profile and posts fetched successfully",
            painter,
            posts,
        });
    }
    catch (error) {
        console.error("Error fetching painter profile and posts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.painterProfile = painterProfile;
////////////////////////////////////////////////////////////
const updatePainterDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const painterId = req.params.id;
    const details = req.body;
    try {
        const painter = yield painterModel_1.default.findByIdAndUpdate(painterId, details, { new: true });
        if (!painter) {
            return res.status(404).json({ message: "Painter not found" });
        }
        res.json({ message: "Details updated successfully", painter });
    }
    catch (error) {
        console.error("Error updating details:", error);
        res.status(500).json({ message: "Failed to update details" });
    }
});
exports.updatePainterDetails = updatePainterDetails;
////////////////////////////////////////////////////////////
const createSlot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [data] = req.body.slots;
        const { date, amount } = data;
        const { painterId } = req.params;
        const existingSlot = yield slots_1.default.findOne({ painterId, date });
        if (existingSlot) {
            return res.status(409).json({ message: 'Slot already exists' });
        }
        const newSlot = new slots_1.default({
            date,
            amount,
            painterId,
        });
        yield newSlot.save();
        return res.status(201).json({ message: 'Slot created successfully', slot: newSlot });
    }
    catch (error) {
        console.error('Error creating slot:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.createSlot = createSlot;
////////////////////////////////////////////////////////////
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(404).json({ message: "Post ID not found" });
        }
        const deletedPost = yield postModels_1.default.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        return res.status(200).json({ message: "Post deleted successfully", deletedPost });
    }
    catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deletePost = deletePost;
//# sourceMappingURL=painterController.js.map