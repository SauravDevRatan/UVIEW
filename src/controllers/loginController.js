import asyncHandeler from "../utils/asyncHandler.js";
import {User} from "../models/userModels.js";
import {ApiError} from "../utils/APIerror.js";
import {ApiResponse }from "../utils/APIresponse.js";
import jwt from "jsonwebtoken";
import {uploadOnCloudniary} from "../utils/cloudinary.js";


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
        const decodedtoken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
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
    
        const{accessToken,refreshToken:newRrefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
    
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

const changePassword=asyncHandeler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.auth?._id)
    const isCorrectPassword=await user.isPasswordCorrect(oldPassword)

    if (!isCorrectPassword) {
        throw new ApiError(402,"incorrect password");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,
                {},
                "PASSWORD UPDATED SUCCESSFULLY"
            ));
})

const getCurrentuser=asyncHandeler(async(req,res)=>{
    const user=await User.findById(req.auth?._id).select("-password")
    return res.status(200)
    .json(new ApiResponse(200, user, "CURRENT USER FETCHED SUCCESSFULLY"))
})
const updateAccountDetails=asyncHandeler(async(req,res)=>{
    let {email,fullName}=req.body;
    if(!email && !fullName){
        throw new ApiError(402,"PLEASE ENTER DETAILS TO BE UPDATED")
    }
     const user=await User.findById(req.auth?._id)
    if(!email){email=user.email};
    if(!fullName){fullName=user.fullName};
    const updatedUser=await User.findByIdAndUpdate(req.auth?._id,
        {
            $set:{fullName,email}
        },{new:true}
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, updatedUser, "CURRENT USER FETCHED SUCCESSFULLY"));
})

const updateuserAvatar=asyncHandeler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(404,"Avatar file missing");
    }
    const avatar=await uploadOnCloudniary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(404,"Avatar furl not found from cloudinary");
    }
    const user=await User.findByIdAndUpdate(req.auth?._id,{$set:{avatar:avatar.url}},{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "avatar updated successfully"));
})
const updateusercoverImage=asyncHandeler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(404,"coverimage file missing");
    }
    const coverImage=await uploadOnCloudniary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(404,"Acoverimage not found from cloudinary");
    }
    const user=await User.findByIdAndUpdate(req.auth?._id,{$set:{coverImage:coverImage.url}},{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "coverpage updated successfully"));
})

const getUserChannelProfile=asyncHandeler(async(req,res)=>{
    const {username}=req.params;
    if (!username?.trim()) {
        throw new ApiError(404,"USERNAME NOT FOUND");
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase() 
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscripbedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.auth?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscripbedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ]);

    console.log(channel);

    if(!channel?.length){
        throw new ApiError(404,"CHANNEL DOES NOT EXIST")
    }

    return res.status(200)
    .json(new ApiResponse(200,channel[0],"USER CHANNEL FETCHED SUCCESSFULLY"))
})


export {getUserChannelProfile,loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentuser,updateAccountDetails,updateuserAvatar,updateusercoverImage};