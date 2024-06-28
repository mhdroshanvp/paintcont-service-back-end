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
exports.graph1 = exports.dashboard = exports.deletePost = exports.getDeletedPosts = exports.isBlockedPainter = exports.adminPainter = exports.isBlocked = exports.adminUser = exports.login = void 0;
const adminModel_1 = __importDefault(require("../../models/adminModel"));
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const painterModel_1 = __importDefault(require("../../models/painterModel"));
const postModels_1 = __importDefault(require("../../models/postModels"));
////////////////////////////////////////////////////////////
const login = (req, res, next) => {
    const { username, password } = req.body;
    adminModel_1.default.findOne({ username })
        .then((validAdmin) => {
        if (!validAdmin) {
            const error = {
                StatusCode: httpStatusCode_1.STATUS_CODES.NOT_FOUND.toString(),
                message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.NOT_FOUND],
            };
            return res
                .status(httpStatusCode_1.STATUS_CODES.NOT_FOUND)
                .json({ success: false, message: error.message });
        }
        if (validAdmin && validAdmin.password !== password) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.UNAUTHORIZED)
                .json({ success: false, message: "Incorrect password" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ username: validAdmin.username, role: "admin" }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });
        // Send token in cookie
        res
            .cookie("admin_token", token, { httpOnly: true })
            .status(httpStatusCode_1.STATUS_CODES.OK)
            .json({
            user: validAdmin,
            token,
            success: true,
            message: "User validated",
        });
    })
        .catch((error) => {
        console.error(error);
        next(error);
        res
            .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    });
};
exports.login = login;
////////////////////////////////////////////////////////////
const adminUser = (req, res, next) => {
    userModel_1.default
        .find()
        .then((user) => {
        if (!user) {
            return res.status(httpStatusCode_1.STATUS_CODES.FORBIDDEN).json({
                success: false,
                message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.FORBIDDEN],
            });
        }
        res
            .status(httpStatusCode_1.STATUS_CODES.OK)
            .json({
            success: true,
            message: "user list fetched successfully",
            user,
        });
    })
        .catch((error) => {
        console.log(error);
        res
            .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({
            success: false,
            message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR],
        });
    });
};
exports.adminUser = adminUser;
////////////////////////////////////////////////////////////
const isBlocked = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.NOT_FOUND)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.NOT_FOUND] });
        }
        user.isBlocked = !user.isBlocked;
        yield user.save();
        res.status(httpStatusCode_1.STATUS_CODES.OK).json({ success: true, message: "success" });
    }
    catch (error) {
        console.log(error);
        res
            .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    }
});
exports.isBlocked = isBlocked;
////////////////////////////////////////////////////////////
const adminPainter = (req, res, next) => {
    painterModel_1.default
        .find()
        .then((painter) => {
        if (!painter) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.NOT_FOUND)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.NOT_FOUND] });
        }
        res
            .status(httpStatusCode_1.STATUS_CODES.OK)
            .json({ success: true, message: "user list fetched successfully", painter });
    })
        .catch((error) => {
        console.log(error);
        res
            .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    });
};
exports.adminPainter = adminPainter;
////////////////////////////////////////////////////////////
const isBlockedPainter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const painterId = req.params.id;
        const painter = yield painterModel_1.default.findById(painterId);
        if (!painter) {
            return res
                .status(httpStatusCode_1.STATUS_CODES.NOT_FOUND)
                .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.NOT_FOUND] });
        }
        painter.isBlocked = !painter.isBlocked;
        yield painter.save();
        res.status(httpStatusCode_1.STATUS_CODES.OK).json({ success: true, message: "success" });
    }
    catch (error) {
        console.log(error);
        res
            .status(httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    }
});
exports.isBlockedPainter = isBlockedPainter;
//////////////////////////////////////////////////////////// 
const getDeletedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedPosts = yield postModels_1.default.find({ isDelete: true });
        if (!deletedPosts.length) {
            return res.status(404).json({ success: false, message: "No deleted posts found" });
        }
        res.status(200).json({ success: true, posts: deletedPosts });
    }
    catch (error) {
        console.error('Error fetching deleted posts:', error);
        res.status(500).json({ success: false, message: httpStatusCode_1.ERR_MESSAGE[httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR] });
    }
});
exports.getDeletedPosts = getDeletedPosts;
//////////////////////////////////////////////////////////// 
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: postId } = req.params;
        console.log("I'm here");
        console.log(postId, "are you there...!?");
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
//////////////////////////////////////////////////////////// 
const dashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.find();
        const painter = yield painterModel_1.default.find();
        const blockedUser = yield userModel_1.default.find({ isBlocked: true });
        const blockedPainter = yield painterModel_1.default.find({ isBlocked: true });
        if (!user) {
            return res.status(404).json({ success: false, message: "There is no user" });
        }
        if (!painter) {
            return res.status(404).json({ success: false, message: "There is no painter" });
        }
        return res.status(200).json({ message: "Data fetched successfully", user, painter, blockedUser, blockedPainter });
    }
    catch (error) {
        console.log(error);
    }
});
exports.dashboard = dashboard;
//////////////////////////////////////////////////////////// 
const graph1 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield postModels_1.default.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        if (!posts || posts.length === 0) {
            return res.status(404).json({ success: false, message: "There are no posts" });
        }
        return res.status(200).json({ success: true, message: "Data fetched successfully", posts });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.graph1 = graph1;
//# sourceMappingURL=adminController.js.map