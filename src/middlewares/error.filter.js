import { z } from "zod";
import HttpException from "../libs/http-exeception.js";

const ErrorFilter = (err, req, res, next) => {
  const { stack, status = 500, message = "Server Error" } = err;
  // logger.error(stack);
  if (err instanceof HttpException) {
    return res.status(status).json({
      ok: false,
      status,
      msg: message,
    });
  } else if (err instanceof z.ZodError) {
    return res.status(400).json({
      ok: false,
      status: 400,
      msg: `${err.errors[0].path[0]} ${err.errors[0].message.toLowerCase()}.`,
    });
  } else {
    return res.status(422).json({
      ok: false,
      status: 422,
      msg: "잘못된 접근입니다.",
    });
  }
};

export default ErrorFilter;
