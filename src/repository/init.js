export const dropChatTableSQL = "DROP TABLE IF EXISTS chat";

export const createChatTableSQL = `CREATE TABLE IF NOT EXISTS chat (
  chat_id VARCHAR(36) NOT NULL,
  version VARCHAR(10) NOT NULL,
  message VARCHAR(255) NOT NULL,
  user JSON NOT NULL,
  room JSON NOT NULL,
  time BIGINT NOT NULL,
  PRIMARY KEY (chat_id)
  ) engine=InnoDB;`;

// export const createTtlEventSQL = `CREATE EVENT ttl_event
//   ON SCHEDULE EVERY 1 DAY
//   DO
//   BEGIN
//     DELETE FROM chat WHERE time < NOW() - INTERVAL 7 DAY;
//   END;`;
