dotenv.config();

import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import http from "http";
import morgan from "morgan";
import redisClient from "./configs/redis.js";
import HttpException from "./libs/http-exeception.js";
import ErrorFilter from "./middlewares/error.filter.js";
import chatRouter from "./routes/chats.routes.js";

redisClient.on("error", function (err) {
  throw err;
});
await redisClient.connect();

const app = express();
const isProd = process.env.NODE_ENV === "production";

app.set("port", process.env.PORT || 8000);
app.set("trust proxy", true);

/* CONFIG */
if (isProd) {
  app.use(hpp());
  app.use(helmet());
  app.use(morgan("combined"));
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
} else {
  app.use(morgan("dev"));
  app.use(cors());
}

app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/chats", chatRouter);

app.use((req, res, next) => {
  const error = new HttpException(
    `${req.method} ${req.url} 라우터가 없습니다.`,
    404
  );
  next(error);
});

app.use(ErrorFilter);

const server = http.createServer(app);
server.listen(app.get("port"), async () => {
  try {
    console.log(
      `⚡️[server]: Server is running at http://localhost:${app.get("port")}`
    );
  } catch (error) {
    console.log(error);
  }
});
