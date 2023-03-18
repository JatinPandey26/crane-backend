import express from "express";
import {
  createNote,
  deleteNote,
  getNoteOfUser,
  getPublicNotes,
  likeNote,
  togglePublic,
  updateNote,
} from "../Controllers/note.controller.js";
import { verifyToken } from "../middleware/verifyUser.js";

const router = express.Router();

router.route("/create").post(verifyToken, createNote);
router.route("/delete/:id").delete(verifyToken, deleteNote);
router.route("/update/:id").put(verifyToken, updateNote);
router.route("/my/:id").get(verifyToken, getNoteOfUser);
router.route("/public").get(getPublicNotes);
router.route('/:id').put(verifyToken,togglePublic)
router.route("/like/:id").put(verifyToken,likeNote)

export { router as noteRouter };
