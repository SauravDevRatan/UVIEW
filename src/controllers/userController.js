import asyncHandeler from "../utils/asyncHandler.js";

const registerUser=asyncHandeler(async(req,res)=>{
    // res.staus(200).json(
    //     {
    //         message:"ok"
    //     }
    // )
    res.status(200).json({ message: "ok" });

})

export {registerUser};