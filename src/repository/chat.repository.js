import db from "../configs/db.js";
import { getAllChatsFromRedis } from "./redis.repository.js";

/**
 * 채팅 생성
 * @param {import("../libs/validators/chat.js").FullChat} chat
 * @returns {number} - 생성된 row 수
 */
export const createChat = async (chat) => {
  const query = `INSERT INTO chat (chat_id, version, message, user, room, time)
VALUES (?, ?, ?, ?, ?, ?)`;

  /* MySQL Synchronize */
  const [rows] = await db.query(query, [
    chat.chat_id,
    chat.version,
    chat.message,
    JSON.stringify(chat.user),
    JSON.stringify(chat.room),
    chat.time,
  ]);
  return rows.affectedRows;
};

/**
 * 전체 채팅 조회 (req.query로 roomId 전달)
 * @param {string} roomId - 채팅방의 room.room_id
 * @returns {Promise<import("../libs/validators/chat.js").FullChat[]>}  캐시된 채팅 내역이 있다면 캐시된 내역, 없다면 디비에서 받아온 내역.
 */
export const findAllChats = async (roomId) => {
  return await getAllChatsFromRedis(roomId);
};

// /**
//  * 채팅 아이디 및 index를 통한 채팅 단일 조회
//  * @param {string} roomId - 조회할 채팅방의 room.room_id
//  * @param {string} index - 조회할 채팅의 index
//  * @returns {Promise<import("../libs/validators/chat.js").FullChat>}조회된 채팅
//  */
// export const findOneChat = async (roomId, index) => {
//   const chat = await getOneChatFromRedis(roomId, index);
//   return chat;
// };

/**
 * DB 채팅 수정
 * @param {string} chatId - 수정할 채팅의 chat.chat_id
 * @param {Promise<import("../libs/validators/chat.js").UpdateChatDto>} dto - update dto
 * @returns {number} - 수정된 row 수
 */
export const updateChat = async (chatId, dto) => {
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

  values.push(chatId);

  const setClause = setClauses.join(", ");

  /* MySQL Synchronize */
  const query = `UPDATE chat SET ${setClause} WHERE chat_id = ?`;
  const [rows] = await db.query(query, values);
  return rows.affectedRows;
};

/**
 * DB 내의 채팅 삭제
 * @param {string} chatId - 삭제할 채팅의 chat.chat_id
 * @returns {number} - 삭제된 row 수
 */
export const deleteChat = async (chatId) => {
  const query = `DELETE FROM chat WHERE chat_id = ?`;
  const [rows] = await db.query(query, chatId);
  return rows.affectedRows;
};
