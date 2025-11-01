import asyncHandeler from "../utils/asyncHandler.js";
import {User} from "../models/userModels.js";
import {ApiError} from "../utils/APIerror.js";
import {ApiResponse }from "../utils/APIresponse.js";
import jwt from "jasonwebtoken";


const generateAccessTokenAndRefreshToken=async(userID)=>{
    try {
        const user=await User.findById(userID);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.refreshAccessToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong")
    }
}

const loginUser=asyncHandeler(async(req,res)=>{
    //get username as well as email form the logineer;
    let {username,email,password}=req.body;
    if(!username && !email) {throw new ApiError(400,"please enter username or email");}
    //if username do not exist no user found
    let user=await User.findOne({$or:[{username},{email}]});
    if (!user) {
        throw new ApiError(404,"user not found please enter correct email or username");
    }
    //if password is incorrect say password incorrect
    const isPassValid=await user.isPasswordCorrect(password);
    if (!isPassValid) {
        throw new ApiError(401,"please enter valid password");
    } 
    //acess token
    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
    //sent cookies
    const options={
        httpOnly:true,
        secure:true
    }
    //you are authorised to login inside
    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
         new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user is logged in now"))
}
);

const logoutUser=asyncHandeler(async(req,res)=>{
    await User.findByIdAndUpdate( req.auth._id,
        {
            $set:{
                refreshToken:undefined
            }
        },{new:true}
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(
         new ApiResponse(200,{},"user is logged out"))
})

const refreshAccessToken=asyncHandeler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
     if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
     }
    try {
        const decodedtoken= jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedtoken?._id);
        if(!user){
            throw new ApiError(401,"invalid refresh token")
         }
         if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
         }
         const options={
            httpOnly:true,
            secure:true
         }
    
        const{accessToken,newRrefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
    
        return res.status(200)
        .cookie("refreshToken",newRrefreshToken,options)
        .cookie("accessToken",accessToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:newRrefreshToken},
                "ACCESSS TOKEN REFRESHED SUCCESSFULLY"
            )
        )
    } catch (error) {
            throw new ApiError(401,error?.message||"Invalid refresh Token")
    }
})
export {loginUser,logoutUser,refreshAccessToken};