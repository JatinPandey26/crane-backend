import { Note } from "../Models/note.model.js";
import { User } from "../Models/user.model.js";

export const createNote = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("please provide title and description");
    }

    const note = await Note.create({
      title,
      description,
      createdBy: req.user._id,
    });

    res.status(201).send(note);
  } catch (error) {} 
};
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("bad request");

    const note = await Note.findById(id);
    if (!note) return res.status(404).send("note not found");

    const user = await User.findById(note.createdBy);

    if (user._id.toString() !== req.user._id.toString())
      return res.status(401).send("only owner can delete note");

    await note.likedBy.forEach((element) => {
      removeLikedNoteFromUser(element, note._id);
    });

    await Note.findByIdAndDelete(id);

    return res.status(200).send("note deleted");
  } catch (error) {}
};
export const updateNote = async (req, res) => {
  try {
    res.send("working on it");
  } catch (error) {}
};

export const getNoteOfUser = async (req, res) => {
  try {
    const q = req.query;
    const filters = {
      ...(q.search && { title: { $regex: q.search, $options: "i" } }),
    };

    const { id } = req.params;
    if (!id) return res.status(400).send("bad request");
    const notes = await Note.find({ createdBy: id, ...filters }).sort(
      q.sort.toString() === "true" ? { createdAt: 1 } : { title: -1 }
    );
    res.status(200).send(notes);
  } catch (error) {}
};

export const getPublicNotes = async (req, res) => {
  try {
    const notes = await Note.find({ isPublic: true }).sort({ likedBy: -1 });
    res.status(200).send(notes);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const togglePublic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("bad request");
    const note = await Note.findById(id);
    if (!note) return res.status(404).send("note not found");
    if (note.createdBy.toString() !== req.user._id.toString())
      return res.status(401).send("only owner can toggle public");

    await Note.findByIdAndUpdate(id, { isPublic: !note.isPublic });

    res.status(200).send(note);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const likeNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("bad request");
    const note = await Note.findById(id);

    const isIncluded = note.likedBy.includes(req.user._id);

    if (isIncluded) {
      const newLikedBy = note.likedBy.filter(
        (like) => like.toString() !== req.user._id.toString()
      );

      const newLikedNotes = req.user.likedNotes.filter(
        (like) => like.toString() !== id
      );

      await User.findByIdAndUpdate(req.user._id, { likedNotes: newLikedNotes });

      await Note.findByIdAndUpdate(id, {
        likedBy: newLikedBy,
      });
      return res.status(200).send("disliked");
    }

    await User.findByIdAndUpdate(req.user._id, {
      likedNotes: [...req.user.likedNotes, id],
    });

    await Note.findByIdAndUpdate(id, {
      likedBy: [...note.likedBy, req.user._id],
    });

    res.status(200).send(note);
  } catch (error) {
    return res.status(500).send(error);
  }
};

async function removeLikedNoteFromUser(userId, noteId) {
  const user = await User.findById(userId);
  const newLikedNotes = user.likedNotes.filter(
    (element) => element.toString() !== noteId.toString()
  );

  await User.findByIdAndUpdate(userId, { likedNotes: newLikedNotes });
}
