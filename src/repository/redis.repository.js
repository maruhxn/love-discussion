import config from "../configs/configs.js";
import redisClient from "../configs/redis.js";

/**
 * CREATE 요청 시 새로운 데이터를 앞에 추가하고, 100개 유지
 * @param {string} roomId
 * @param {import("../libs/validators/chat.js").FullChat} value
 * @returns {Promise<void>}
 */
export const pushToCachedChats = async (roomId, value) => {
  await redisClient
    .multi()
    .LPUSH(`v1@${roomId}`, JSON.stringify(value))
    .LTRIM(`v1@${roomId}`, 0, config.MAX_CACHE_LENGTH - 1)
    .exec();
};

/**
 * UPDATE 혹은 DELETE 요청 시 이전 데이터를 삭제 후 새로운 데이터 삽입.
 * @param {string} roomId
 * @param {string} index
 * @param {import("../libs/validators/chat.js").FullChat} updatedChat
 * @returns {Promise<void>}
 */
export const updateCachedChat = async (roomId, index, updatedChat) => {
  await redisClient.LSET(`v1@${roomId}`, index, JSON.stringify(updatedChat));
};

/**
 * Redis에서 roomId와 대응되는 모든 value(채팅 내역 최대 100개) 불러오기
 * @param {string} roomId
 * @returns {Promise<import("../libs/validators/chat.js").FullChat[]>}
 */
export const getAllChatsFromRedis = async (roomId) => {
  const chatStrings = await redisClient.LRANGE(`v1@${roomId}`, 0, -1);
  const chats = chatStrings.map((chat) => JSON.parse(chat));
  return chats;
};

/**
 * Redis에서 roomId 및 index와 대응되는 chat 가져오기
 * @param {string} roomId
 * @param {string} index
 * @returns {Promise<import("../libs/validators/chat.js").FullChat>}
 */
export const getOneChatFromRedis = async (roomId, index) => {
  return JSON.parse(await redisClient.LINDEX(`v1@${roomId}`, index));
};
