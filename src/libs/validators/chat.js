import { z } from "zod";
import { RoomValidator, UpdateRoomValidator } from "./room.js";
import { UserValidator } from "./user.js";

export const FullChatValidator = z.object({
  chat_id: z.string().min(1).max(26),
  version: z.string().min(1).max(10),
  message: z.string().min(1).max(255),
  user: UserValidator,
  room: RoomValidator,
  time: z.number(),
});

export const ChatValidator = z.object({
  message: z.string().min(1).max(255),
  user: UserValidator,
  room: RoomValidator,
  version: z.string().min(1).max(10),
});

export const UpdateChatValidator = z.object({
  message: z.string().min(1).max(255).optional(),
  user: UserValidator.optional(),
  room: UpdateRoomValidator.optional(),
  version: z.string().min(1).max(10).optional(),
});

/** @typedef { z.infer<typeof FullChatValidator> FullChat } */
/** @typedef { z.infer<typeof ChatValidator> Chat } */
/** @typedef { z.infer<typeof UpdateChatValidator> UpdateChatDto } */
