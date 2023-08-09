export const dropChatTableSQL = "DROP TABLE IF EXISTS chat";

export const createChatTableSQL = `CREATE TABLE IF NOT EXISTS chat (
  version VARCHAR(10) NOT NULL,
  chat_id VARCHAR(26) NOT NULL,
  user_ip VARCHAR(45) NOT NULL,
  room_id VARCHAR(26) NOT NULL,
  isCached TINYINT(1) DEFAULT 0,
  contents VARCHAR(255) NOT NULL,
  references JSON,
  room JSON NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (chat_id)
) engine=InnoDB;`;
