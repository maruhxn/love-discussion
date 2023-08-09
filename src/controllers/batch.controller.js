import db from "../configs/db.js";
import redisClient from "../configs/redis.js";
import * as chatRepository from "../repository/chat.js";

export const synchronize = async () => {
  const groupedChats = {};
  const chatIdsToUpdate = [];
  const chats = await chatRepository.findAllChatsNotCached();

  /* Group Chats By RoomId */
  for (const chat of chats) {
    const roomId = chat.room_id;
    chatIdsToUpdate.push(chat.chat_id);

    if (!groupedChats[roomId]) {
      groupedChats[roomId] = [];
    }

    groupedChats[roomId].push(chat);
  }

  /* Synchronize */
  Object.keys(groupedChats).forEach(async (roomId) => {
    try {
      groupedChats[roomId].forEach(
        async (chat) => await redisClient.LPUSH(roomId, JSON.stringify(chat))
      );

      await redisClient.lTrim(roomId, 0, 99);

      await db.query("UPDATE chat SET isCached = 1 WHERE chat_id IN (?)", [
        chatIdsToUpdate,
      ]);
    } catch (error) {
      console.error(error);
    }
  });
};
