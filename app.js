import express  from "express";
import cors from "cors"

import { testFunction } from "./database.js";

const app = express()


app.use(cors());


app.get("/test", async (req,res)=>{
    const test = await testFunction(req,res)
    res.status(200).send(test)
})

app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send('Something Broke!')
});

app.listen(5000, ()=>{
    console.log('server is running on 5000');
})