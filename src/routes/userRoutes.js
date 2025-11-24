import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import{getWatchHistory,getUserChannelProfile,loginUser,logoutUser,refreshAccessToken,changePassword
    ,getCurrentuser,updateAccountDetails,updateuserAvatar,updateusercoverImage} from "../controllers/loginController.js";
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
userRouter.route("/changepassword").post(verifyJWT,changePassword);
userRouter.route("/me").get(verifyJWT, getCurrentuser);
userRouter.route("/updateDetails").patch(verifyJWT, updateAccountDetails);
userRouter.route("/updateAvatar").patch(verifyJWT, upload.single("avatar"), updateuserAvatar);
userRouter.route("/updateCover").patch(verifyJWT, upload.single("coverImage"), updateusercoverImage);
userRouter.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
userRouter.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default userRouter;