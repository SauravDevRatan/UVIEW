import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import{loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentuser,updateAccountDetails,
    updateuserAvatar,updateusercoverImage} from "../controllers/loginController.js";
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

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refreshToken").post(refreshAccessToken);
userRouter.route("/changepassowrd").post(verifyJWT,changePassword);
userRouter.route("/me").get(verifyJWT, getCurrentuser);
userRouter.route("/updateDetails").post(verifyJWT, updateAccountDetails);
userRouter.route("/updateAvatar").post(verifyJWT, upload.single("avatar"), updateuserAvatar);
userRouter.route("/updateCover").post(verifyJWT, upload.single("coverImage"), updateusercoverImage);

export default userRouter;