import { z } from "zod";

export const PostValidator = z.object({
  contents: z.string().min(1).max(255),
  references: z.any().optional(),
  title: z.string().min(1).max(255),
  version: z.string().min(1).max(10),
  room_id: z.string(),
});
