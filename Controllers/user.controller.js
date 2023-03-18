import { User } from "../Models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const RegisterController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).send("please fill all the fields");
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).send("email or username already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      (err, payload) => {
        if (err) return res.status(500).send("something went wrong");
        res
          .cookie("access_token", payload, {
            httpOnly: true,
            sameSite: "none",
          })
          .status(201)
          .send(newUser);
      }
    );
  } catch (error) {
    res.status(400).send(error);
  }
};
export const LoginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("please fill all the fields");
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("incorrect email or password");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).send("incorrect email or password");

    await jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      (err, payload) => {
        if (err) return res.status(500).send("something went wrong");
        res
          .cookie("access_token", payload, {
            httpOnly: true,
            sameSite: "none",
          })
          .status(201)
          .send(user);
      }
    );
  } catch (error) {
    res.status(400).send(error);
  }
};
export const LogoutController = async (req, res, next) => {
  try {
    req.user = null;
    res.clearCookie("access_token").status(200).send("logout successful");
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) return res.status(400).send("please login");
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).send("you are not authorized");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).send("you are not authorized");
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("bad request");
    const user = await User.findById(id);
    if (!user) return res.status(404).send("user not found");
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};
