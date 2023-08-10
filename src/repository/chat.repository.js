import { ulid } from "ulid";
import db from "../configs/db.js";
import {
  getAllChatsFromRedis,
  getOneChatFromRedis,
  pushToCachedChats,
  updateCachedChat,
} from "./redis.repository.js";

/**
 * 채팅 생성
 * @param {import("../libs/validators/chat.js").Chat} dto
 */
export const createChat = async (dto) => {
  const chatULID = ulid();
  const { message, room, user, version } = dto;
  const query = `INSERT INTO chat (chat_id, version, message, user, room, time)
VALUES (?, ?, ?, ?, ?, ?)`;

  const chat = {
    chat_id: chatULID,
    version,
    message,
    user,
    room,
    time: Date.now(),
  };

  await pushToCachedChats(room.room_id, chat);

  /* MySQL Synchronize */
  await db.query(query, [
    chat.chat_id,
    chat.version,
    chat.message,
    JSON.stringify(chat.user),
    JSON.stringify(chat.room),
    chat.time,
  ]);
};

/**
 * 전체 채팅 조회 (req.query로 roomId 전달)
 * @param {string} roomId - 채팅방의 room.room_id
 * @returns {Promise<import("../libs/validators/chat.js").FullChat[]>}  캐시된 채팅 내역이 있다면 캐시된 내역, 없다면 디비에서 받아온 내역.
 */
export const findAllChats = async (roomId) => {
  return await getAllChatsFromRedis(roomId);
};

/**
 * 채팅 아이디 및 index를 통한 채팅 단일 조회
 * @param {string} roomId - 채팅방의 room.room_id
 * @param {string} index - 채팅의 index
 * @returns {Promise<import("../libs/validators/chat.js").FullChat>}조회된 채팅
 */
export const findOneChat = async (roomId, index) => {
  const chat = await getOneChatFromRedis(roomId, index);
  return chat;
};

/**
 * 채팅 수정
 * @param {import("../libs/validators/chat.js").FullChat} oldChat - 채팅방의 room.room_id
 * @param {string} roomId - 채팅방의 room.room_id
 * @param {string} chatId - 채팅의 chat.chat_id
 * @param {string} index - 채팅의 index
 * @param {Promise<import("../libs/validators/chat.js").UpdateChatDto>} dto - update dto
 */
export const updateChat = async (oldChat, roomId, index, dto) => {
  const updatedChat = { ...oldChat, ...dto, time: Date.now() };

  await updateCachedChat(roomId, index, updatedChat);

  const setClauses = [];
  const values = [];

  /* Creaet Dynamic SQL Query  */
  Object.keys(dto).forEach((data) => {
    setClauses.push(data + "=?");
    values.push(
      typeof dto[data] === "object"
        ? // ? JSON.stringify({ ...oldChat[data], ...dto[data] })
          JSON.stringify(dto[data])
        : dto[data]
    );
  });

  values.push(oldChat.chat_id);

  const setClause = setClauses.join(", ");

  /* MySQL Synchronize */
  const query = `UPDATE chat SET ${setClause} WHERE chat_id = ?`;
  await db.query(query, values);
};

/**
 * 채팅 삭제. 정확히는 채팅의 message를 "삭제된 채팅입니다."로 update
 * @param {import("../libs/validators/chat.js").FullChat} oldChat - 채팅방의 room.room_id
 * @param {string} roomId - 채팅방의 room.room_id
 * @param {string} chatId - 채팅의 chat.chat_id
 * @param {string} index - 채팅의 index
 */
export const deleteChat = async (oldChat, roomId, index) => {
  const deletedChat = {
    ...oldChat,
    message: "삭제된 채팅입니다.",
    time: Date.now(),
  };

  await updateCachedChat(roomId, index, deletedChat);

  /* MySQL Synchronize */
  const query = `DELETE FROM chat WHERE chat_id = ?`;
  await db.query(query, oldChat.chat_id);
};
