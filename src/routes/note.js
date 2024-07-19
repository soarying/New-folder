const express = require("express");
const noteController = require("../controllers/note");
const authenticateToken = require("../middlewares/all");
const router = express.Router();

router.get("/note", authenticateToken, noteController.getAllNotes);
router.get("/note/:id", authenticateToken, noteController.getNoteById);
router.post("/note", authenticateToken, noteController.createNote);
router.post("/share", authenticateToken, noteController.shareNote);
router.put("/note", authenticateToken, noteController.updateNote);
router.delete("/note/:id", authenticateToken, noteController.deleteNote);
router.get("/search", authenticateToken, noteController.searchNotes);

module.exports = router;
