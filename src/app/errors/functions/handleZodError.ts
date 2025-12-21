import { ZodError } from "zod";
import { IErrorResponse, IErrorSource } from "../../utils/interface/error";
import { httpStatusCode } from "../../utils/enum/statusCode";

const handleZodError = (err: ZodError): IErrorResponse => {
  const errorSources: IErrorSource[] = err.issues.map((issue) => {
    return {
      path: String(issue?.path[issue.path.length - 1]),
      message: issue.message,
    };
  });

  return {
    statusCode: httpStatusCode.BAD_REQUEST,
    message: "Validation Error. Enter valid data",
    errorSources,
  };
};

export default handleZodError;
