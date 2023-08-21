import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 5000,
  max: 3,
  standardHeaders: true, // 헤더에 `RateLimit-*` 를 포함합니다
  legacyHeaders: false, // `X-RateLimit-*` 헤더를 비활성화합니다.
  handler(req, res) {
    res.status(this.statusCode).json({
      ok: false,
      msg: "너무 많은 요청을 보냈습니다. 잠시 후에 이용해주세요.",
    });
  },
});

export default rateLimiter;
