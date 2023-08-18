import { z } from "zod";
import HttpException from "../libs/http-exeception.js";

const ErrorFilter = (err, req, res, next) => {
  const { stack, status = 500, message = "Server Error" } = err;
  console.error(err);
  if (err instanceof HttpException) {
    return res.status(status).json({
      ok: false,
      msg: message,
    });
  } else if (err instanceof z.ZodError) {
    return res.status(400).json({
      ok: false,
      msg: `${err.errors[0].path[0]}이(가) 형식에 맞지 않습니다.`,
    });
  } else {
    return res.status(422).json({
      ok: false,
      msg: "잘못된 접근입니다.",
    });
  }
};

export default ErrorFilter;
