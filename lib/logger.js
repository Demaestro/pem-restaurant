import pino from "pino";

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

const transport = process.env.NODE_ENV === "production"
  ? undefined
  : { target: "pino/file", options: { destination: 1 } };

export const logger = pino({
  level,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.newPassword",
      "req.body.currentPassword",
      "req.body.confirmPassword",
      "*.password",
      "*.passwordHash",
      "*.password_hash",
      "*.token",
      "*.totpSecret",
      "*.totp_secret",
    ],
    censor: "[redacted]",
  },
  base: { service: "pem-api" },
  ...(transport ? { transport } : {}),
});

export function createHttpLogger() {
  return {
    logger,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      if (req.url === "/api/health") return "debug";
      return "info";
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  };
}
