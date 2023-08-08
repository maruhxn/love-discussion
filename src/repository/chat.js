import { ulid } from "ulid";
import db from "../configs/db.js";
import redisClient from "../configs/redis.js";

/**
 * 채팅 생성
 * @param {string} userIp
 * @param {{ version: string, room_id: string, title: string, contents: string, references?: JSON }} dto
 * @returns {string} 생성된 채팅의 아이디
 */
export const createChatSQL = async (userIp, dto) => {
  const newUlid = ulid();
  const { contents, version, room, references } = dto;
  const query = `INSERT INTO chat (chat_id, user_ip, version, contents, room, references, created_at)
VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`;
  await db.query(query, [
    newUlid,
    userIp,
    version,
    contents,
    JSON.stringify(room),
    JSON.stringify(references),
  ]);

  return newUlid;
};

/**
 * 전체 채팅 조회 (req.query로 postId 전달)
 * @param {string} roomId - 채팅의 room 내의 room_id
 * @returns 캐시된 채팅 내역이 있다면 캐시된 내역, 없다면 디비에서 받아온 내역.
 */
export const findAllChatsSQL = async (roomId) => {
  let chats;
  const cachedChats = await redisClient.lRange(roomId, 0, -1);
  const query = `SELECT * FROM chat WHERE room ->> '$."room_id"' = ?`;

  if (cachedChats.length <= 0) {
    chats = (await db.query(query, [roomId]))[0];
    await redisClient.lPush(roomId, JSON.stringify(chats));
  }

  return chats ?? JSON.parse(cachedChats);
};

/**
 * 채팅 아이디를 통한 채팅 단일 조회
 * @param {string} chatId - 채팅의 chat_id
 * @returns 조회된 채팅
 */
export const findOneChatByIdSQL = async (chatId) => {
  const query = `SELECT * FROM chat WHERE chat_id = ?`;
  const [rows] = (await db.query(query, [chatId]))[0];
  return rows;
};

/**
 * 해당 채팅을 작성한 유저의 아이피를 반환
 * @param {string} chatId
 * @returns 해당 채팅을 작성한 유저의 아이피
 */
export const findUserIpById = async (chatId) => {
  const [rows] = await db.query(
    `SELECT user_ip FROM chat WHERE chat_id = ?`,
    chatId
  );
  return rows[0].user_ip;
};

/**
 * 채팅 수정
 * @param {string} chatId - 채팅 아이디
 * @param {{ version?: string, room_id?: string, title?: string, contents?: string, references?: JSON }} dto - update dto
 */
export const updateChatByIdSQL = async (chatId, dto) => {
  const setClauses = [];
  const values = [];
  Object.keys(dto).forEach((data) => {
    setClauses.push(data + "=?");
    values.push(
      typeof dto[data] === "object" ? JSON.stringify(dto[data]) : dto[data]
    );
  });
  values.push(chatId);
  const setClause = setClauses.join(", ");

  const query = `UPDATE chat SET ${setClause} WHERE chat_id = ?`;
  await db.query(query, values);
};

/**
 * 채팅 삭제. 성공 시 1, 실패 시 0 반환
 * @param {string} chatId - 채팅 아이디
 * @returns 삭제된 row 수
 */
export const deleteChatByIdSQL = async (chatId) => {
  const query = `DELETE FROM chat WHERE chat_id = ?`;
  const [rows] = await db.query(query, chatId);
  return rows.affectedRows;
};
