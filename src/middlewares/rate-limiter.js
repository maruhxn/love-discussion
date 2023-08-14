import rateLimit from "express-rate-limit";

// 10초에 5번만 요청할 수 있습니다.
const rateLimiter = rateLimit({
  windowMs: 1000, // 10초
  max: 1000,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler(req, res) {
    res.status(this.statusCode).json({
      ok: false,
      msg: "너무 많은 요청을 보냈습니다. 잠시 후에 이용해주세요.",
    });
  },
});

export default rateLimiter;
