import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/APIerror.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {User} from "../models/userModels.js";

dotenv.config({ path: "./.env" });

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if (!token) {
            throw new ApiError(200,"Unauthorozed request")
        }
    
        const decodedeToken=jwt.verify(token,process.env.TOKEN_SECRET);
    
        const user=await User.findById(decodedeToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401,"invalid access token ");
        }
        req.auth=user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message||"invalid accessToken")
    }

})