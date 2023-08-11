import dotenv from "dotenv";
import request from "supertest";
import app from "../app.js";
import db from "../configs/db.js";
import { createChatTableSQL, dropChatTableSQL } from "../repository/init.js";
dotenv.config();

const chatIds = [];

beforeAll(async () => {
  await Promise.all([db.query(dropChatTableSQL), db.query(createChatTableSQL)]);
});

describe("POST /api/v1/chats", () => {
  it("올바른 body 제공 시 chat 생성", async () => {
    const response = await request(app)
      .post("/api/v1/chats")
      .send({
        room: {
          version: "v1",
          description: "contents",
          title: "title",
          room_id: "1",
        },
        user: {
          ip: "::1",
        },
        message: "test",
        version: "v1",
      });
    expect(response.status).toBe(201);
    expect(response.type).toBe("application/json");
    expect(response.body).toEqual({
      ok: true,
      msg: "채팅 생성 성공",
    });
  });

  it("입력받은 body가 유효성 검증 실패 시, 400 error 반환", async () => {
    const response = await request(app)
      .post("/api/v1/chats")
      .send({
        room: {
          version: "v1",
          description: "contents",
          title: "title",
        },
        version: "v1",
      })
      .expect(400);
    expect(response.status).toBe(400);
    expect(response.type).toBe("application/json");
    expect(response.body).toEqual(
      expect.objectContaining({
        ok: false,
        msg: expect.any(String),
      })
    );
  });

  it("body.user내의 어떠한 값도 들어가있지 않다면 400 error 반환", async () => {
    const response = await request(app)
      .post("/api/v1/chats")
      .send({
        room: {
          version: "v1",
          description: "contents",
          title: "title",
          room_id: "1",
        },
        user: {},
        message: "test",
        version: "v1",
      })
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.type).toBe("application/json");
    expect(response.body).toEqual(
      expect.objectContaining({
        ok: false,
        msg: "유저 정보를 1개 이상 입력해주세요.",
      })
    );
  });
});

describe("GET /api/v1/chats", () => {
  it("roomId를 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app).get("/api/v1/chats").expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보를 입력해주세요.",
    });
  });

  it("roomId를 제공했고, 채팅 내역이 있다면 반환", async () => {
    const response = await request(app)
      .get("/api/v1/chats?roomId=1")
      .expect(200);

    response.body.data.forEach((chat) => chatIds.push(chat.chat_id));
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      msg: "채팅 전체 조회 성공",
      data: expect.any(Array),
    });
  });

  it("roomId를 제공했지만, 채팅 내역이 없다면 404 error 반환", async () => {
    const response = await request(app)
      .get("/api/v1/chats?roomId=2")
      .expect(404);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅 내역이 없습니다.",
    });
  });
});

describe("GET /api/v1/chats/:chatId", () => {
  it("roomId를 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .get(`/api/v1/chats/${chatIds[0]}?index=0`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  it("index를 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .get(`/api/v1/chats/${chatIds[0]}?roomId=1`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  it("roomId와 index 모두 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .get(`/api/v1/chats/${chatIds[0]}`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  describe("roomId와 index 모두 제공했고", () => {
    it("채팅 정보가 없다면 404 반환", async () => {
      const response = await request(app)
        .get(`/api/v1/chats/${chatIds[0]}?roomId=0&index=0`)
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        ok: false,
        msg: "채팅 정보가 없습니다.",
      });
    });

    describe("채팅 정보가 있고", () => {
      it("chatId와 조회된 chat의 chat_id가 일치하지 않으면 400 반환", async () => {
        const response = await request(app)
          .get(`/api/v1/chats/1?roomId=1&index=0`)
          .expect(400);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          ok: false,
          msg: "채팅 아이디가 일치하지 않습니다.",
        });
      });

      it("chatId와 조회된 chat의 chat_id가 일치하면 채팅 정보 반환", async () => {
        const response = await request(app)
          .get(`/api/v1/chats/${chatIds[0]}?roomId=1&index=0`)
          .expect(200);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          ok: true,
          msg: "채팅 단일 조회 성공",
          data: expect.objectContaining({
            chat_id: expect.any(String),
            version: expect.any(String),
            message: expect.any(String),
            user: expect.any(Object),
            room: expect.any(Object),
            time: expect.any(Number),
          }),
        });
      });
    });
  });
});

describe("PATCH /api/v1/chats/:chatId", () => {
  it("roomId를 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .patch(`/api/v1/chats/${chatIds[0]}?index=0`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  it("index를 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .patch(`/api/v1/chats/${chatIds[0]}?roomId=1`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  it("roomId와 index 모두 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .patch(`/api/v1/chats/${chatIds[0]}`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  describe("roomId와 index 모두 제공했고", () => {
    it("body에 아무 내용도 전달하지 않는다면", async () => {
      const response = await request(app)
        .patch(`/api/v1/chats/${chatIds[0]}?roomId=1&index=0`)
        .send({})
        .expect(400);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        ok: false,
        msg: "수정할 내용을 입력해주세요.",
      });
    });

    it("올바른 body가 들어왔고, 채팅 정보가 있다면 채팅 수정", async () => {
      const response = await request(app)
        .patch(`/api/v1/chats/${chatIds[0]}?roomId=1&index=0`)
        .send({ message: "update!" })
        .expect(201);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        ok: true,
        msg: "채팅 수정 성공",
      });
    });
  });
});

describe("DELETE /api/v1/chats/:chatId", () => {
  it("roomId를 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .delete(`/api/v1/chats/${chatIds[0]}?index=0`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  it("index를 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .delete(`/api/v1/chats/${chatIds[0]}?roomId=1`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  it("roomId와 index 모두 제공하지 않았다면, 400 error 반환", async () => {
    const response = await request(app)
      .delete(`/api/v1/chats/${chatIds[0]}`)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "채팅방 정보 및 인덱스 정보를 입력해주세요.",
    });
  });

  it("roomId와 index 모두 제공했고, 채팅 정보가 있다면 채팅 삭제(=수정)", async () => {
    const response = await request(app)
      .delete(`/api/v1/chats/${chatIds[0]}?roomId=1&index=0`)
      .expect(200);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      msg: "채팅 삭제 성공",
    });
  });
});
