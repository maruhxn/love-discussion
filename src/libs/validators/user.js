import { z } from "zod";

export const UserValidator = z.object({
  ip: z.any().optional(),
  agent: z.any().optional(),
  uuid: z.any().optional(),
});

/** @typedef { z.infer<typeof UserValidator> User } */
