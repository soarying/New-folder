const { Note, User, mySequelize } = require("../models");
const { Op } = require("sequelize");
const { mapNoteToReturn } = require("../functions/note");

const getAllNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    return await await Note.findAll({
      attributes: ["noteUUID", "title", "content"],
      include: {
        model: User,
        through: { attributes: [] },
        attributes: ["userUUID"],
        where: {
          userUUID: userId,
        },
      },
    }).then((notes) => {
      const returnNotes = mapNoteToReturn(notes);
      res.status(200).json(returnNotes);
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error" });
  }
};

const searchNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q } = req.query;
    return await Note.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { content: { [Op.iLike]: `%${q}%` } },
        ],
      },
      include: {
        model: User,
        through: { attributes: ["isOwner"] },
        attributes: ["userUUID"],
        where: {
          userUUID: userId,
        },
      },
    }).then((notes) => {
      const returnNotes = mapNoteToReturn(notes);

      res.status(200).json(returnNotes);
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    return await Note.findOne({
      where: {
        noteUUID: id,
      },
      include: {
        model: User,
        through: { attributes: [] },
        attributes: ["userUUID"],
        where: {
          userUUID: userId,
        },
      },
    }).then((note) => {
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      const returnNote = {
        noteId: note.noteUUID,
        title: note.title,
        content: note.content,
      };
      res.status(200).json(returnNote);
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error" });
  }
};

const createNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content } = req.body;
    let returnNote;
    return await mySequelize
      .transaction(async (t) => {
        return await User.findOne({
          attributes: ["userId"],
          where: { userUUID: userId },
          transaction: t,
        }).then(async (user) => {
          if (!user) {
            throw new Error("User not found");
          }
          return await Note.create(
            {
              title,
              content,
            },
            {
              transaction: t,
            }
          ).then(async (note) => {
            returnNote = {
              noteId: note.noteUUID,
              title: note.title,
              content: note.content,
            };
            return await user.addNote(note, {
              through: { isOwner: true },
              transaction: t,
            });
          });
        });
      })
      .then(() => {
        res.status(200).json(returnNote);
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error" });
  }
};

const updateNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content, noteId } = req.body;

    return await Note.findOne({
      attributes: ["noteUUID", "title", "content", "noteId"],
      where: {
        noteUUID: noteId,
      },
      include: {
        model: User,
        through: { attributes: ["isOwner"], where: { isOwner: true } },
        where: {
          userUUID: userId,
        },
      },
    }).then(async (note) => {
      if (!note) {
        return res
          .status(404)
          .json({ message: "Note not found or you are not the owner" });
      }
      return await note
        .update(
          {
            title,
            content,
          },
          { where: { noteUUID: note.noteUUID } }
        )
        .then((note) => {
          const returnNote = {
            noteId: note.noteUUID,
            title: note.title,
            content: note.content,
          };
          res.status(200).json(returnNote);
        });
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    return await Note.findOne({
      attributes: ["noteId", "noteUUID"],
      where: {
        noteUUID: id,
      },
      include: {
        model: User,
        through: { attributes: ["isOwner"], where: { isOwner: true } },
        where: {
          userUUID: userId,
        },
      },
    }).then(async (note) => {
      if (!note) {
        return res
          .status(404)
          .json({ message: "Note not found or You are not the owner" });
      }
      return await note
        .destroy({ where: { noteId: note.noteId } })
        .then(() => {
          res.status(200).json({ message: "Note deleted successfully" });
        })
        .catch((error) => {
          throw new Error(error);
        });
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error" });
  }
};

const shareNote = async (req, res) => {
  try {
    const { recipientId, noteId } = req.body;
    return await Note.findOne({
      attributes: ["noteId", "noteUUID"],
      where: { noteUUID: noteId },
    }).then(async (note) => {
      if (!note) {
        throw new Error("Note not found");
      }
      return await User.findOne({
        attributes: ["userId", "userUUID"],
        where: { userUUID: recipientId },
      })
        .then(async (user) => {
          if (!user) {
            throw new Error("Recipient not found");
          }
          return await note
            .addUser(user, { through: { isOwner: false } })
            .then(() => {
              res.status(200).json({ message: "Note shared successfully" });
            });
        })
        .catch((error) => {
          throw new Error(error);
        });
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  searchNotes,
};
