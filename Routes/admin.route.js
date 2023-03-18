import express from "express";
import { changeUserRole, deleteNote, deleteUser, getNotes, getUsers } from "../Controllers/admin.controller.js";
import { verifyAdmin, verifyToken } from "../middleware/verifyUser.js";
  
const router = express.Router();

router.route("/users").get(verifyToken,verifyAdmin , getUsers );
router.route("/notes").get(verifyToken,verifyAdmin , getNotes );
router.route("/user/:id").put(verifyToken,verifyAdmin , changeUserRole );
router.route("/user/:id").delete(verifyToken,verifyAdmin , deleteUser );
router.route("/note/:id").delete(verifyToken,verifyAdmin , deleteNote );


export { router as adminRouter };
