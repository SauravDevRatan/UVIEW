import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors(
    {
        origin:process.env.ORIGIN,
        credentials:true
    }
))
app.use(express.json({limit:"16kb"}));// to accept jason data
app.use(express.urlencoded({extended:true,limit:"20kb"}));//to accept data caonning from url in proper format   extended true data inside data
app.use(express.static("public"))//to explore data save usch as pdf images
app.use(cookieParser());

//routes
import userRouter from "./routes/userRoutes.js";

app.use("/api/v1/users",userRouter);

export {app};