"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpStatusCode_1 = require("../constants/httpStatusCode"); // Adjust the path accordingly
const errorHandlerMiddleware = (err, req, res, next) => {
    let statusCode = httpStatusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = err.message || httpStatusCode_1.ERR_MESSAGE[statusCode] || 'Internal server error';
    console.log('Error from middleware at error handler middleware');
    return res.status(statusCode).json({
        success: false,
        message,
        StatusCode: statusCode,
    });
};
exports.default = errorHandlerMiddleware;
//# sourceMappingURL=errorHandlerMiddleware.js.map