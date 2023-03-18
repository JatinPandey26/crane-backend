import { Note } from "../Models/note.model.js";
import { User } from "../Models/user.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    return res.status(200).json(notes);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send("No id found");
    }

    const user = await User.findById(id);

    if (!user) return res.status(404).send("User not found");

    if (user.isAdmin) return res.status(400).send("User is admin");

    await user.likedNotes.forEach((element) => {
      removeUserFromLikedNote(user._id, element);
    });

    await Note.deleteMany({ createdBy: id });

    await User.findByIdAndDelete(id);

    return res.status(200).send("User deleted");
  } catch (error) {
    res.status(500).send(error);
  }
};

export const deleteNote = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(404).send("No id found");
    const note = await Note.findById(id);
    if (!note) return res.status(404).send("Note not found");

    await note.likedBy.forEach((element) => {
      removeLikedNoteFromUser(element, note._id);
    });

    await Note.findByIdAndDelete(id);

    return res.status(200).send("Note deleted");
  } catch (error) {
    res.status(500).send(error);
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(404).send("No id found");

    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");

    if (user.isAdmin) return res.status(400).send("User is admin");

    await User.findByIdAndUpdate(id, { isAdmin: !user.isAdmin });

    return res
      .status(200)
      .send("User role changed to " + !user.isAdmin ? "admin" : "user");
  } catch (error) {
    res.status(500).send(error);
  }
};

async function removeLikedNoteFromUser(userId, noteId) {
  const user = await User.findById(userId);
  const newLikedNotes = user.likedNotes.filter(
    (element) => element.toString() !== noteId.toString()
  );

  await User.findByIdAndUpdate(userId, { likedNotes: newLikedNotes });
}

async function removeUserFromLikedNote(userId, noteId) {
  const note = await Note.findById(noteId);

  const newLikedBy = note.likedBy.filter(
    (element) => element.toString() !== userId.toString()
  );

  await Note.findByIdAndUpdate(noteId, { likedBy: newLikedBy });
}
