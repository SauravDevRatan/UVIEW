import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import{loginUser,logoutUser,refreshAccessToken} from "../controllers/loginController.js";
import {upload} from "../middleware/multerMiddleware.js";
import  { verifyJWT } from "../middleware/authMiddleware.js";
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

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refreshToken").post(refreshAccessToken);

export default userRouter;