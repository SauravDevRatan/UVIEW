import dotenv from "dotenv";
import connectDB  from "./db/index.js";
dotenv.config({path:"./.env"});
import { app } from "./app.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8080,()=>{
        console.log(`app is listening at ${process.env.PORT}`)
    })
})
.catch((err)=>{console.log(`Error`,err)});





































































/*
import express from"express";
const app=express();
;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error",(err)=>{
            console.log(err);
            throw err;
        })
        app.listen(process.env.PORT,()=>{
                console.log(`App is listening at ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("ERROR:",error)
        throw error
    }
})()
*/