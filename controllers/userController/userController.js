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
exports.getHashtags = exports.bookedSlot = exports.updateUserProfile = exports.changePassword = exports.createComment = exports.painterIndMsg = exports.followerList = exports.followPainter = exports.ClientPainterProfile = exports.addAddress = exports.searchPainters = exports.handleReport = exports.userProfile = exports.updateLike = exports.getAllPost = exports.contactPage = exports.userLogin = exports.resendOTP = exports.mail4otp = exports.otpVerification = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_1 = __importDefault(require("../../models/otp"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const postModels_1 = __importDefault(require("../../models/postModels"));
const painterModel_1 = __importDefault(require("../../models/painterModel"));
const conversations_1 = __importDefault(require("../../models/conversations"));
const message_1 = __importDefault(require("../../models/message"));
const mongoose_1 = __importDefault(require("mongoose"));
const slots_1 = __importDefault(require("../../models/slots"));
const BookingModel_1 = __importDefault(require("../../models/BookingModel"));
const socket_io_1 = require("../../socket/socket.io");
const contactusModel_1 = __importDefault(require("../../models/contactusModel"));
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    const cleanedUsername = username.replace(/\s+/g, '').toLowerCase();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    try {
        const existingPainter = yield userModel_1.default.findOne({ username: cleanedUsername });
        const existingEmail = yield userModel_1.default.findOne({ email: trimmedEmail });
        if (existingPainter) {
            return res
                .status(400)
                .json({ success: false, message: "Username already exists" });
        }
        if (existingEmail) {
            return res
                .status(400)
                .json({ success: false, message: "Email already exists" });
        }
        // OTP generation
        const generatedOTP = Math.floor(100000 + Math.random() * 900000);
        // Password hashing
        const hashedPass = bcryptjs_1.default.hashSync(trimmedPassword, 2);
        if (!hashedPass) {
            throw new Error("Password hashing failed");
        }
        // Create new painter document
        yield userModel_1.default.create({
            username: cleanedUsername,
            email: trimmedEmail,
            password: hashedPass,
            isValid: false,
        });
        // Store email and OTP in the OTPModel collection
        const otpData = new otp_1.default({
            userMail: trimmedEmail,
            otp: generatedOTP,
        });
        yield otpData.save();
        // OTP mail setup
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
            to: trimmedEmail,
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
                    .status(400)
                    .json({ success: false, message: "Error sending email" });
            }
            else {
                console.log("Email sent:", info.response);
                return res
                    .status(250)
                    .json({ success: true, message: "OTP sent successfully" });
            }
        });
    }
    catch (error) {
        console.log("Error at user signup:", error);
        if (error.code === 11000) {
            const keyValue = error.keyValue;
            return res
                .status(409)
                .json({ success: false, message: `${keyValue} already exists` });
        }
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
exports.signup = signup;
//////////////////////////////////////////////////////////////////
const otpVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    console.log(req.body, "-------");
    try {
        const otpRecord = yield otp_1.default.findOne({ userMail: email });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found for the provided email",
            });
        }
        if (otpRecord.otp !== parseInt(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Painter not found" });
        }
        user.isValid = true;
        yield user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ username: user._id, role: 'user' }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });
        // Send token in cookie and response
        res.cookie("token", token, { httpOnly: true }).status(200).json({
            user: user,
            token,
            success: true,
            message: "User validated",
        });
        // Remove the extra response here
        // res.status(200).json({ success: true, message: "OTP verified successfully" });
    }
    catch (error) {
        console.log("Error at OTP verification:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
});
exports.otpVerification = otpVerification;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const mail4otp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            // Generate OTP
            const generatedOTP = Math.floor(100000 + Math.random() * 900000);
            // Store OTP in the OTPModel collection
            const otpData = new otp_1.default({
                userMail: email,
                otp: generatedOTP,
            });
            yield otpData.save();
            // Send OTP via email
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
                subject: "OTP Verification",
                text: `Your OTP for verification of Paintcont is: ${generatedOTP}. 
              Do not share the OTP with anyone.
              For further details and complaints visit www.paintcont.com`,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res
                        .status(400)
                        .json({ success: false, message: "Error sending email" });
                }
                else {
                    console.log("Email sent:", info.response);
                    return res.status(200).json({ success: true, message: "OTP sent successfully" });
                }
            });
        }
        else {
            return res
                .status(404)
                .json({ success: false, message: "Email does not exist" });
        }
    }
    catch (error) {
        console.log("Error in mail4otp:", error.message);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
exports.mail4otp = mail4otp;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
                    .status(400)
                    .json({ success: false, message: "Error sending email" });
            }
            else {
                console.log("New OTP sent:------", newOTP);
                res.status(200).json({ success: true, message: "New OTP sent successfully" });
            }
        });
    }
    catch (error) {
        console.log("Error in resend OTP:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.resendOTP = resendOTP;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const cleanedUsername = username.replace(/\s+/g, '').toLowerCase();
        const trimmedPassword = password.trim();
        const user = yield userModel_1.default.findOne({ username: cleanedUsername });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Username not found" });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(trimmedPassword, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid password" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ username: user._id, role: 'user' }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });
        // Send token in cookie
        res.cookie("token", token, { httpOnly: true }).status(200).json({
            user: user,
            token,
            success: true,
            message: "User validated",
        });
    }
    catch (error) {
        console.log("Error in user login:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.userLogin = userLogin;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const contactPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, mail, message } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!mail) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }
    try {
        yield contactusModel_1.default.create({ name, mail, message });
        res.status(200).json({ success: true, message: "Data added successfully" });
    }
    catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.contactPage = contactPage;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getAllPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const page = parseInt(((_a = req.query) === null || _a === void 0 ? void 0 : _a.page) || '1');
        const limit = parseInt(((_b = req.query) === null || _b === void 0 ? void 0 : _b.limit) || '2');
        const skip = (page - 1) * limit;
        const posts = yield postModels_1.default.find().sort({ time: -1 })
            .populate({ path: 'painterId', model: 'painter' })
            .skip(skip)
            .limit(limit);
        const totalPosts = yield postModels_1.default.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);
        console.log("post length", posts.length, "page number", page);
        res.status(200).json({ success: true, posts, totalPages });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});
exports.getAllPost = getAllPost;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId } = req.body;
        let liked;
        const post = yield postModels_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const userIndex = post.likes.indexOf(userId);
        if (userIndex === -1) {
            post.likes.push(userId);
            liked = true;
        }
        else {
            post.likes.splice(userIndex, 1);
            liked = false;
        }
        yield post.save();
        res.status(200).json({ success: true, message: "Like status updated successfully", post, liked });
    }
    catch (error) {
        console.error("Error updating like status:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.updateLike = updateLike;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const userProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { phone, address } = req.body;
        const user = yield userModel_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        yield user.save();
        return res.status(200).json({ message: "Address added successfully", user });
    }
    catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.userProfile = userProfile;
///////////////////////////////////////////////////////////////////////////
const handleReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId } = req.body;
        let reported;
        const post = yield postModels_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found", });
        }
        const userIndex = post.reportCount.indexOf(userId);
        if (userIndex === -1) {
            post.reportCount.push(userId);
            reported = true;
        }
        else {
            post.reportCount.splice(userIndex, 1);
            reported = false;
        }
        if (post.reportCount.length >= 10) {
            post.isDelete = true;
        }
        yield post.save();
        res.status(200).json({ success: true, message: "Like status updated successfully", post, reported });
    }
    catch (error) {
        console.error('Error handling report:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.handleReport = handleReport;
///////////////////////////////////////////////////////////////////////////
const searchPainters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        let searchCriteria = {};
        let hashPost = [];
        if (name.startsWith('#')) {
            const searchVal = name.substring(1);
            const regexSearchVal = new RegExp(searchVal, 'i');
            hashPost = yield postModels_1.default.find({ specialised: regexSearchVal }).populate('painterId');
        }
        else {
            searchCriteria = {
                $or: [
                    { username: { $regex: name, $options: 'i' } },
                    { 'address.location': { $regex: name, $options: 'i' } }
                ]
            };
            const posts = yield postModels_1.default.find().populate({
                path: 'painterId',
                match: searchCriteria
            });
            hashPost = posts.filter(post => post.painterId !== null);
        }
        const filteredPostsByHash = hashPost.filter(post => post.painterId !== null);
        console.log(filteredPostsByHash, "******************");
        res.status(200).json({ success: true, posts: filteredPostsByHash });
    }
    catch (error) {
        console.error("Error searching painters:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.searchPainters = searchPainters;
///////////////////////////////////////////////////////////////////////////
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, phoneNo, userId } = req.body;
        const newUserAddress = {
            houseNo: address.houseNo,
            location: address.location,
            pin: address.pin
        };
        const user = yield userModel_1.default.findById(userId);
        user.address = newUserAddress;
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { phone: phoneNo, address: user.address }, { new: true });
        if (!updatedUser) {
            throw new Error('User not found');
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (error) {
        console.log(error);
    }
});
exports.addAddress = addAddress;
///////////////////////////////////////////////////////////////////////////
const ClientPainterProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const painter = yield painterModel_1.default.findById(id);
        if (!painter) {
            return res.status(404).json({ message: "Painter not found" });
        }
        const posts = yield postModels_1.default.find({ painterId: painter._id });
        const slot = yield slots_1.default.find({ painterId: id });
        return res.status(200).json({ message: "Painter data fetched successfully", painter, posts, slot });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.ClientPainterProfile = ClientPainterProfile;
///////////////////////////////////////////////////////////////////////////
const followPainter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { painterId, userId } = req.body;
        const painter = yield painterModel_1.default.findById(painterId);
        if (!painter) {
            return res.status(404).json({ success: false, message: "Painter not found" });
        }
        painter.followers = painter.followers || [];
        let followed = false;
        if (painter.followers.includes(userId)) {
            painter.followers = painter.followers.filter((followerId) => followerId !== userId);
        }
        else {
            painter.followers.push(userId);
            followed = true;
        }
        yield painter.save();
        return res.status(200).json({ success: true, followed });
    }
    catch (error) {
        console.error("Error updating follow status:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.followPainter = followPainter;
const followerList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const painter = yield painterModel_1.default.findById(id);
        if (!painter || !painter.followers) {
            return res.status(404).json({ message: 'Painter not found or no followers' });
            ``;
        }
        const followers = painter.followers;
        let followersList = [];
        for (let i = 0; i < followers.length; i++) {
            const followerId = followers[i];
            const user = yield userModel_1.default.findById(followerId);
            if (user) {
                followersList.push(user);
            }
        }
        res.json(followersList);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.followerList = followerList;
const painterIndMsg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, painterId } = req.body;
        const convMembers = yield conversations_1.default.findOne({ members: { $all: [userId, painterId] } });
        if (!convMembers) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
        const convId = convMembers._id.toString();
        const messageHistory = yield message_1.default.find({ conversationId: convId });
        return res.status(200).json({ success: true, messageHistory });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});
exports.painterIndMsg = painterIndMsg;
//////////////////////////////////////////////////////////////////////////////  
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, content, userId, painterId } = req.body;
        const post = yield postModels_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const user = yield userModel_1.default.findById(userId);
        const id = new mongoose_1.default.Types.ObjectId(userId);
        const newComment = {
            text: content,
            userId: id,
            time: new Date(),
            userName: user === null || user === void 0 ? void 0 : user.username
        };
        post.comments.push(newComment);
        yield post.save();
        res.status(201).json({ success: true, comment: newComment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.createComment = createComment;
//////////////////////////////////////////////////////////////////////////////  
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, newPassword } = req.body;
        const hashedPass = bcryptjs_1.default.hashSync(newPassword, 2);
        if (!hashedPass) {
            throw new Error("Password hashing failed");
        }
        const result = yield userModel_1.default.findByIdAndUpdate(userId, { $set: { password: hashedPass } }, { new: true });
        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
});
exports.changePassword = changePassword;
/////////////////////////////////////////////////////////////////////////////////////
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, houseNo, location, pin, userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const updateData = Object.assign(Object.assign(Object.assign({}, (name && { username: name })), (phone && { phone })), { address: Object.assign(Object.assign(Object.assign({}, (houseNo && { houseNo })), (location && { location })), (pin && { pin })) });
        const result = yield userModel_1.default.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
        if (!result) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user: result });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateUserProfile = updateUserProfile;
/////////////////////////////////////////////////////////////////////////////////////
const bookedSlot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, bookSlot, painterId } = req.body;
        const { date, slotId } = bookSlot;
        const newBooking = new BookingModel_1.default({
            date,
            painterId,
            userId,
        });
        const slot = yield slots_1.default.findByIdAndUpdate(slotId, { status: "booked" });
        if (!slot) {
            return res.status(404).json({ error: "There is no slot" });
        }
        yield newBooking.save();
        const io = (0, socket_io_1.getIO)();
        io.emit("slotBooked", { userId, bookSlot, painterId });
        res.status(201).json({ message: "Booking successful", booking: newBooking, slot });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.bookedSlot = bookedSlot;
///////////////////////////////////////////////////////////
const getHashtags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const painters = yield painterModel_1.default.find();
        // console.log(painters, "===============");
        res.status(200).json({ success: true, painters });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.getHashtags = getHashtags;
//# sourceMappingURL=userController.js.map