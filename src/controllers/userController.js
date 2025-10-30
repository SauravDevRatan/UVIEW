import asyncHandeler from "../utils/asyncHandler.js";
import {User} from "../models/userModels.js";
import {ApiError} from "../utils/APIerror.js";
import {uploadOnCloudniary} from "../utils/cloudinary.js";
import {ApiResponse }from "../utils/APIresponse.js";

const registerUser=asyncHandeler(async(req,res)=>{
//get usrer details from frontend
let{username,email,fullName,password,avatar,coverImage}=req.body;
//validation-not empty
if ([username,email,fullName,password].some((e)=>e?.trim()==="")) {
    throw new ApiError(400,"all fields are required")
}

//check if user already exist:username,email,
if(await User.findOne({$or:[{username},{email}]})){
    throw new ApiError(409,"useralready exist")
  };

//check for images from avatar
const avatarLocalPath=req.files?.avatar?.[0].path;
const coverImageLocalPath=req.files?.coverImage?.[0].path;
if (!avatarLocalPath) {
    throw new ApiError("400","avatar image required")
}
//update avatar to cloudinary
const Avatar  =await uploadOnCloudniary(avatarLocalPath);
const Coverimage=await uploadOnCloudniary(coverImageLocalPath);

if(!Avatar){throw new ApiError("400","avatar image required")}
//create user object-create entry in db
const postinguser=new User (
    {
        username:username.toLowerCase(),
        email:email,
        fullName:fullName,
        password:password,
        avatar:Avatar.url,
        coverImage:Coverimage?.url ||""
    }
   )
   const updatedUser=await  postinguser.save();
//remove passworsd and refresh token fiel from RESPONSE/CHECK FOR USER CREATION
   const existingUser= await User.findById(updatedUser._id).select("-password -refreshToken");
   
if (!existingUser) {
    throw new ApiError(500,"something went wrong while uploading data please try again")
}
//RETURN RES

   return res.status(200).json(
    ApiResponse(201,existingUser,"user registered successfully")
   )
   
})

export {registerUser};