const mapNoteToReturn = (notes) => {
  return notes.map((note) => {
    return {
      noteId: note.noteUUID,
      title: note.title,
      content: note.content,
    };
  });
};

module.exports = { mapNoteToReturn };
