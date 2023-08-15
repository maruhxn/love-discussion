# 연애 토론 게시판

maruhxn

## TODO

- App runner with Docker(image-based) -> CI/CD
- kafka 공부
- planetscale branch 공부

# V1

## SCHEMA

CREATE TABLE IF NOT EXISTS chat (
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
) engine=InnoDB;

## GET

- Cache Hit: ok
- Cache Miss: DB Read 후 조회도니 결과를 Redis Write 해주고, 결과 `UPDATE chat SET isCached = 1 WHERE chat_id IN (?)`

## POST

- 모두 DB에 직접 Write
- 10초마다 Bot이 DB와 Redis Synchronize

# V2

## SCHEMA

CREATE TABLE IF NOT EXISTS chat (
chat_id VARCHAR(36) NOT NULL,
version VARCHAR(10) NOT NULL,
message VARCHAR(255) NOT NULL,
user JSON NOT NULL,
room JSON NOT NULL,
time BIGINT NOT NULL,
PRIMARY KEY (chat_id)
) engine=InnoDB;

메인은 Redis, 서브(무결성 유지 및 영구 저장)는 mysql

Write Through 방식 사용

## GET

- Redis에서만 조회

## POST

- Redis에도 넣고, DB에도 넣음.
