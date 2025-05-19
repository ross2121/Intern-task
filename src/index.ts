import  express from "express";
import { notificationrouter } from "./notification/notification";

const app=express();
const port=3000;
app.use(express.json());
app.use("/api/v1",notificationrouter);

app.use(express.json());
app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})