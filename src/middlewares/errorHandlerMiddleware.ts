import { ErrorRequestHandler } from 'express';
import { STATUS_CODES, ERR_MESSAGE } from '../constants/httpStatusCode'; // Adjust the path accordingly
import { cutomError } from '../Interfaces/customError';

const errorHandlerMiddleware: ErrorRequestHandler = (err: cutomError, req, res, next) => {
  let statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR;

  const message = err.message || ERR_MESSAGE[statusCode] || 'Internal server error';

  console.log('Error from middleware at error handler middleware');

  return res.status(statusCode).json({
    success: false,
    message,
    StatusCode: statusCode,
  });
};

export default errorHandlerMiddleware;