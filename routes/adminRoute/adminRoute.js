"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../../controllers/adminController/adminController");
const router = express_1.default.Router();
router.post('/login', adminController_1.login);
router.get('/user', adminController_1.adminUser);
router.get('/painter', adminController_1.adminPainter);
router.patch('/user/isBlocked/:id', adminController_1.isBlocked);
router.patch('/painter/isBlocked/:id', adminController_1.isBlockedPainter);
router.get('/posts', adminController_1.getDeletedPosts);
router.delete('/painter/posts/deletePost/:id', adminController_1.deletePost);
router.post('/dashboard', adminController_1.dashboard);
router.post('/dashboard/graph1', adminController_1.graph1);
exports.default = router;
//# sourceMappingURL=adminRoute.js.map