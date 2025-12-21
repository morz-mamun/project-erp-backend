import { Response } from "express";
import { IErrorResponse } from "../utils/interface/error";
import { configuration } from "../config/config";

const sendError = (res: Response, error: IErrorResponse) => {
  res.status(error.statusCode).send({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    error: error.errorSources,
    stack: configuration.env === "development" ? error.stack : undefined,
  });
};

export default sendError;
