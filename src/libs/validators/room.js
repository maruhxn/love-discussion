import { z } from "zod";

export const RoomValidator = z.object({
  room_id: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  video: z.string().optional(),
  url: z.string().optional(),
});

export const UpdateRoomValidator = z.object({
  room_id: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(255).optional(),
  video: z.string().optional(),
  url: z.string().optional(),
});

/** @typedef { z.infer<typeof RoomValidator> Room } */
/** @typedef { z.infer<typeof UpdateRoomValidator> UpdateRoomDto } */
