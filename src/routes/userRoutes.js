import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import{loginUser} from "../controllers/loginController.js";
import {upload} from "../middleware/multerMiddleware.js";
const userRouter=Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",maxCount:1
        },
        {
            name:"coverImage",maxCount:1
        }]
    ),
    registerUser);

userRouter.route("/login").get(loginUser);

export default userRouter;