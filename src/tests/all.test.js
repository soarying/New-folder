const request = require("supertest");
const { Note, User } = require("../models");
const jwt = require("jsonwebtoken");

let token;
let noteUUID;
let userUUID;
let baseURL;

beforeAll(async () => {
  baseURL = "http://localhost:8080";

  // Signup to create a user for testing
  await request(baseURL).post("/signup").send({
    email: "test@example.com",
    password: "password123",
  });

  // Login to get a token
  const res = await request(baseURL)
    .post("/login")
    .send({ email: "test@example.com", password: "password123" });
  token = res.body.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    userUUID = user.userId;
  });
});

describe("Note Routes", () => {
  describe("POST /note", () => {
    it("should create a new note", async () => {
      const res = await request(baseURL)
        .post("/note")
        .set("authorization", `Bearer ${token}`)
        .send({ title: "Test Note", content: "This is a test note." });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("noteId");
      expect(res.body.title).toBe("Test Note");
      expect(res.body.content).toBe("This is a test note.");

      noteUUID = res.body.noteId;
    });
  });

  describe("GET /note", () => {
    it("should get all notes for the user", async () => {
      const res = await request(baseURL)
        .get("/note")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("noteId");
      expect(res.body[0].title).toBe("Test Note");
      expect(res.body[0].content).toBe("This is a test note.");
    });
  });

  describe("GET /note/:id", () => {
    it("should get a note by ID", async () => {
      const res = await request(baseURL)
        .get(`/note/${noteUUID}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("noteId");
      expect(res.body.title).toBe("Test Note");
      expect(res.body.content).toBe("This is a test note.");
    });

    it("should return 404 if note is not found", async () => {
      const res = await request(baseURL)
        .get("/note/invalid-id")
        .set("authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /note", () => {
    it("should update a note", async () => {
      const res = await request(baseURL)
        .put("/note")
        .set("authorization", `Bearer ${token}`)
        .send({
          noteId: noteUUID,
          title: "Updated Note",
          content: "This is an updated note.",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("noteId");
      expect(res.body.title).toBe("Updated Note");
      expect(res.body.content).toBe("This is an updated note.");
    });

    it("should return 404 if note is not found or user is not the owner", async () => {
      const res = await request(baseURL)
        .put("/note")
        .set("authorization", `Bearer ${token}`)
        .send({
          noteId: "invalid-id",
          title: "Updated Note",
          content: "This is an updated note.",
        });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /note/:id", () => {
    it("should delete a note", async () => {
      const res = await request(baseURL)
        .delete(`/note/${noteUUID}`)
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Note deleted successfully");
    });
  });

  describe("GET /search", () => {
    it("should search notes by keyword", async () => {
      const res = await request(baseURL)
        .get("/search")
        .set("authorization", `Bearer ${token}`)
        .query({ q: "test" });
      console.log(res.body);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("noteId");
      expect(res.body[0].title).toBe("Test Note");
      expect(res.body[0].content).toBe("This is a test note.");
    });
  });

  describe("POST /share", () => {
    it("should share a note with another user", async () => {
      await request(baseURL).post("/signup").send({
        email: "recipient@example.com",
        password: "password456",
      });

      const recipientRes = await request(baseURL)
        .post("/login")
        .send({ email: "recipient@example.com", password: "password456" });

      const newToken = recipientRes.body.token;

      const newNote = await request(baseURL)
        .post("/note")
        .set("authorization", `Bearer ${newToken}`)
        .send({
          title: "Test Share Note",
          content: "This is a test Share note.",
        });
      const res = await request(baseURL)
        .post("/share")
        .set("authorization", `Bearer ${newToken}`)
        .send({ recipientId: userUUID, noteId: newNote.body.noteId });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Note shared successfully");
    });
  });
});

afterAll(async () => {
  await Note.destroy({ where: { title: ["Test Note", "Test Share Note"] } });
  await User.destroy({
    where: { email: ["test@example.com", "recipient@example.com"] },
  });
});
