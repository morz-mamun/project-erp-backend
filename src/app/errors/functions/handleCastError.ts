import mongoose from "mongoose";
import { IErrorResponse, IErrorSource } from "../../utils/interface/error";
import { httpStatusCode } from "../../utils/enum/statusCode";

const handleCastError = (error: mongoose.Error.CastError): IErrorResponse => {
  const errorSources: IErrorSource[] = [
    {
      path: error.path,
      message: `Invalid value '${error.value}' for the field '${error.path}'. Expected a valid ${error.kind}.`,
    },
  ];

  return {
    statusCode: httpStatusCode.BAD_REQUEST,
    message: "Invalid input data.",
    errorSources,
  };
};

export default handleCastError;
