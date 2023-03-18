import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { database } from "./utils/database.js";
import { userRouter } from "./Routes/user.route.js";
import cors from "cors";
import { noteRouter } from "./Routes/note.route.js";
import { adminRouter } from "./Routes/admin.route.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
database();

app.use("/users", userRouter);
app.use("/notes", noteRouter);
app.use("/admin", adminRouter);
app.listen(process.env.PORT || 3001, () => {
  console.log("sever is running");
});
