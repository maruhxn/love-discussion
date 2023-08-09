import HttpException from "../libs/http-exeception.js";
import { ChatUpdateValidator, ChatValidator } from "../libs/validators/chat.js";
import * as chatRepository from "../repository/chat.js";

/**
 * GET /chats
 */
export const getAllChats = async (req, res, next) => {
  const { roomId } = req.query;

  if (!roomId) throw new HttpException("채팅방 정보가 없습니다.", 404);

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
export const createChat = async (req, res, next) => {
  const parsedBody = ChatValidator.parse(req.body);

  await chatRepository.createChat(req.ip, parsedBody);

  return res.status(201).json({
    ok: true,
    msg: "채팅 생성 성공",
  });
};

/**
 * GET /chats/:chatId
 */
export const getOneChatById = async (req, res, next) => {
  const { chatId } = req.params;
  const chat = await chatRepository.findOneChatById(chatId);

  if (!chat) throw new HttpException("채팅 정보가 없습니다.", 404);

  return res.status(200).json({
    ok: true,
    msg: "채팅 단일 조회 성공",
    data: chat,
  });
};

/**
 * PATCH /chats/:chatId
 */
export const updateChatById = async (req, res, next) => {
  const { chatId } = req.params;
  const foundedUserIp = await chatRepository.findUserIpById(chatId);

  if (!foundedUserIp) throw new HttpException("채팅 정보가 없습니다.", 404);

  if (foundedUserIp !== req.ip)
    throw new HttpException("유저가 일치하지 않습니다.", 401);

  const parsedBody = ChatUpdateValidator.parse(req.body);

  if (Object.keys(parsedBody).length === 0)
    throw new HttpException("수정할 내용을 입력해주세요.", 400);

  await chatRepository.updateChatById(chatId, parsedBody);

  return res.status(201).json({
    ok: true,
    msg: "채팅 수정  성공",
  });
};

/**
 * DELETE /chats/:chatId
 */
export const deleteChatById = async (req, res, next) => {
  const { chatId } = req.params;
  const foundedUserIp = await chatRepository.findUserIpById(chatId);

  if (!foundedUserIp) throw new HttpException("채팅 정보가 없습니다.", 404);

  if (foundedUserIp !== req.ip)
    throw new HttpException("유저가 일치하지 않습니다.", 401);

  await chatRepository.deleteChatById(chatId);

  return res.status(200).json({
    ok: true,
    msg: "채팅 삭제 성공",
  });
};
