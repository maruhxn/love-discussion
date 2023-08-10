import { z } from "zod";

export const UserValidator = z.object({
  ip: z.string().min(1).max(10).optional(),
  agent: z.string().min(1).max(255).optional(),
  uuid: z.string().optional(),
});

/** @typedef { z.infer<typeof UserValidator> User } */
