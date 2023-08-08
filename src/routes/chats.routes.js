import express from "express";
import {
  createChat,
  deleteChatById,
  getAllChats,
  getOneChatById,
  updateChatById,
} from "../controllers/chats.controller.js";
import catchAsync from "../libs/catch-async.js";
const router = express.Router();

router.route("/").get(catchAsync(getAllChats)).post(catchAsync(createChat));

router
  .route("/:chatId")
  .get(catchAsync(getOneChatById))
  .patch(catchAsync(updateChatById))
  .delete(catchAsync(deleteChatById));

export default router;
