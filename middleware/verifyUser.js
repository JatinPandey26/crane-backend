import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";
export const verifyToken = async (req, res, next) => {
  try { 
    const token = req.cookies.access_token;
    if (!token) return res.status(401).send("Not authorized1");
    const { id } = await jwt.verify(token, process.env.JWT_SECRET);

    if (!id) return res.status(401).send("Not authorized2"); 

    const user = await User.findById(id);

    if (!user) return res.status(401).send("Not authorized3");
    req.user = user;
    next();
  } catch (error) {
    res.send(error);
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {

    if(!req.user) return res.status(401).send("Not authorized");

    if(!req.user.isAdmin) return res.status(401).send("Not authorized as admin");

    next();

  } catch (error) {
    return res.status(500).send(error);
  }
}
