import { z } from "zod";
import { PostValidator } from "./post.js";

export const ChatValidator = z.object({
  contents: z.string().min(1).max(255),
  references: z.any().optional(),
  room: PostValidator,
  version: z.string().min(1).max(10),
});

export const ChatUpdateValidator = z.object({
  contents: z.string().min(1).max(255).optional(),
  references: z.any().optional(),
  room: z.object().optional(),
  version: z.string().min(1).max(10).optional(),
});
