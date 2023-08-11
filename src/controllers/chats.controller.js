import { ulid } from "ulid";
import HttpException from "../libs/http-exeception.js";
import { ChatValidator, UpdateChatValidator } from "../libs/validators/chat.js";
import * as chatRepository from "../repository/chat.repository.js";
import * as redisRepository from "../repository/redis.repository.js";

/**
 * GET /chats
 */
export const getAllChats = async (req, res) => {
  const { roomId } = req.query;

  if (!roomId) throw new HttpException("채팅방 정보를 입력해주세요.", 400);

  const chats = await chatRepository.findAllChats(roomId);

  if (chats.length <= 0) throw new HttpException("채팅 내역이 없습니다.", 404);

  return res.status(200).json({
    ok: true,
    msg: "채팅 전체 조회 성공",
    data: chats,
  });
};

/**
 * POST /chats
 */
export const createChat = async (req, res) => {
  const { message, room, user, version } = ChatValidator.parse(req.body);

  if (Object.keys(user).length === 0)
    throw new HttpException("유저 정보를 1개 이상 입력해주세요.", 400);

  const chat = {
    chat_id: ulid(),
    version,
    message,
    user,
    room,
    time: Date.now(),
  };

  const createdAmt = await chatRepository.createChat(chat);

  if (createdAmt === 0) throw new HttpException("DB 문제 발생", 422);

  await redisRepository.pushChatToRedis(chat.room.room_id, chat);

  return res.status(201).json({
    ok: true,
    msg: "채팅 생성 성공",
  });
};

/**
 * GET /chats/:chatId
 */
// chatID를 받을 필요가 있을까? 인덱스를 받았는데?
export const getOneChatById = async (req, res) => {
  const { roomId, index } = req.query;
  const { chatId } = req.params;

  if (!roomId || !index)
    throw new HttpException("채팅방 정보 및 인덱스 정보를 입력해주세요.", 400);

  const chat = await redisRepository.getOneChatFromRedis(roomId, index);
  // const chat = await chatRepository.findOneChat(chatId);

  if (!chat) throw new HttpException("채팅 정보가 없습니다.", 404);
  if (chat.chat_id !== chatId)
    throw new HttpException("채팅 아이디가 일치하지 않습니다.", 400);

  return res.status(200).json({
    ok: true,
    msg: "채팅 단일 조회 성공",
    data: chat,
  });
};

/**
 * PATCH /chats/:chatId
 */
export const updateChatById = async (req, res) => {
  const { roomId, index } = req.query;
  const { chatId } = req.params;

  if (!roomId || !index)
    throw new HttpException("채팅방 정보 및 인덱스 정보를 입력해주세요.", 400);

  const parsedBody = UpdateChatValidator.parse(req.body);

  if (Object.keys(parsedBody).length === 0)
    throw new HttpException("수정할 내용을 입력해주세요.", 400);

  const oldChat = await redisRepository.getOneChatFromRedis(roomId, index);

  if (!oldChat) throw new HttpException("채팅 정보가 없습니다.", 404);

  const updatedChat = { ...oldChat, ...parsedBody, time: Date.now() };

  await chatRepository.updateChat(chatId, parsedBody);

  await redisRepository.updateCachedChat(roomId, index, updatedChat);

  return res.status(201).json({
    ok: true,
    msg: "채팅 수정 성공",
  });
};

/**
 * DELETE /chats/:chatId
 */
export const deleteChatById = async (req, res) => {
  const { roomId, index } = req.query;
  const { chatId } = req.params;

  if (!roomId || !index)
    throw new HttpException("채팅방 정보 및 인덱스 정보를 입력해주세요.", 400);

  const oldChat = await redisRepository.getOneChatFromRedis(roomId, index);

  if (!oldChat) throw new HttpException("채팅 정보가 없습니다.", 404);

  const deletedChat = {
    ...oldChat,
    message: "삭제된 채팅입니다.",
    time: Date.now(),
  };

  await redisRepository.updateCachedChat(roomId, index, deletedChat);

  await chatRepository.deleteChat(chatId);

  return res.status(200).json({
    ok: true,
    msg: "채팅 삭제 성공",
  });
};
