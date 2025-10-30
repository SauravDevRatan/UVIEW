import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
const userRouter=Router();

userRouter.route("/register").get(registerUser);

export default userRouter;