import express from "express";
import {
  RegisterController,
  LoginController,
  LogoutController,
  getMe,
  getUser,
} from "../Controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyUser.js";
const router = express.Router();

router.route("/register").post(RegisterController);
router.route("/login").post(LoginController);
router.route("/logout").get(verifyToken, LogoutController);
router.route("/me").get(getMe);
router.route("/:id").get(getUser);

export { router as userRouter };
