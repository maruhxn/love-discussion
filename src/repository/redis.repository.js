import dotenv from "dotenv";
import { createClient } from "redis";
import config from "../configs/configs.js";

dotenv.config();

const redisClient = createClient({
  url:
    process.env.NODE_ENV === "production"
      ? process.env.MAIN_REDIS_URL
      : process.env.DEV_REDIS_URL,
});

redisClient.on("error", (err) => console.log("client error", err));
redisClient.on("connect", () => console.log("client is connect"));
redisClient.on("reconnecting", () => console.log("client is reconnecting"));
redisClient.on("ready", () => console.log("client is ready"));

await redisClient.connect();

/**
 * CREATE 요청 시 새로운 데이터를 앞에 추가하고, 100개 유지
 * @param {string} roomId
 * @param {import("../libs/validators/chat.js").FullChat} value
 * @returns {Promise<void>}
 */
export const pushChatToRedis = async (roomId, value) => {
  await redisClient
    .multi()
    .LPUSH(`v1@love@${roomId}`, JSON.stringify(value))
    .LTRIM(`v1@love@${roomId}`, 0, config.MAX_CACHE_LENGTH - 1)
    .exec();
};

/**
 * UPDATE 혹은 DELETE 요청 시 index에 해당하는 char 수정
 * @param {string} roomId
 * @param {string} index
 * @param {import("../libs/validators/chat.js").FullChat} updatedChat
 * @returns {Promise<void>}
 */
export const updateCachedChat = async (roomId, index, updatedChat) => {
  await redisClient.LSET(
    `v1@love@${roomId}`,
    index,
    JSON.stringify(updatedChat)
  );
};

/**
 * roomId와 대응되는 모든 채팅 내역 불러오기
 * @param {string} roomId
 * @returns {Promise<import("../libs/validators/chat.js").FullChat[]>}
 */
export const getAllChatsFromRedis = async (roomId) => {
  const chatStrings = await redisClient.LRANGE(`v1@love@${roomId}`, 0, -1);
  const chats = chatStrings.map((chat) => JSON.parse(chat));
  return chats;
};

/**
 * roomId 및 index와 대응되는 chat 가져오기
 * @param {string} roomId
 * @param {string} index
 * @returns {Promise<import("../libs/validators/chat.js").FullChat>}
 */
export const getOneChatFromRedis = async (roomId, index) => {
  return JSON.parse(await redisClient.LINDEX(`v1@love@${roomId}`, index));
};
