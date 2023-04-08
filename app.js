import express  from "express";
import cors from "cors"

import { testFunction } from "./database.js";

const app = express()

const port = 5000


app.use(cors());
app.get("/", async (req,res)=>{
    res.send("hello world")
})

app.get("/test", async (req,res)=>{
    const test = await testFunction(req,res)
    res.status(200).send(test)
})

app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send('Something Broke!')
});

app.listen(process.env.port || 5000, ()=>{
    console.log(`server is running on ${port}`);
})