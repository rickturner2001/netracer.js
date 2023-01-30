const { z } = require("zod");

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string(),
});

module.exports.envSchema = envSchema;
