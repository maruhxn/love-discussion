dotenv.config();

import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

import HttpException from "./libs/http-exeception.js";
import ErrorFilter from "./middlewares/error.filter.js";
import chatRouter from "./routes/chats.routes.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";

app.set("port", process.env.PORT || 8080);
app.set("trust proxy", 1);

/* CONFIG */
if (isProd) {
  app.use(hpp());
  app.use(helmet());
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/v1/chats", rateLimiter);
app.use("/api/v1/chats", chatRouter);

app.use((req, res, next) => {
  const error = new HttpException(
    `${req.method} ${req.url} 라우터가 없습니다.`,
    404
  );
  next(error);
});

app.use(ErrorFilter);

export default app;
