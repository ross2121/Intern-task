import {PrismaClient} from "@prisma/client"
import Router from "express"
import { sendemail } from "../Push_notification/email";
import { sendSMS } from "../Push_notification/sms";
const prisma=new PrismaClient();
const router=Router();
router.post("/user",async(req:any,res:any)=>{
    const {email,Name,Mobile_No}=req.body;
    console.log(email);
    if(!email||!Name||!Mobile_No){
        return res.status(400).json({message:"Kindly fill all the details"})
    }
    const user=await prisma.user.create({
        data:{
            email,
            Name,
            Mobile_No
        }
    })
return   res.status(200).json({ message: "User created",user}); 
})
router.post("/notifications",async(req:any,res:any)=>{
    const {id,data}=req.body;
    if(!data||!id){
       return res.status(400).json({message:"Fill all the details"})
    }
    console.log("checke");
    const modify=Number(id);
     const existing=await prisma.user.findUnique({
        where:{
            id:modify
        }
     })
     console.log("Dasds");
     if(!existing){
        return res.status(440).json({message:"user not found"})
     }
     sendemail(existing.email,data);
     sendSMS(existing.Mobile_No,data); 
        const notification=await prisma.notification.create({
            data:{
                Content:data,
                user_id:id
            }
        })
       return res.status(200).json({ message: "Notification processed",notification });  
 
})
router.get("/not",async(req:any,res:any)=>{
    const user=await prisma.user.findMany({});
    return res.status(200).json({user});
})
router.get("/notification/:id",async(req:any,res:any)=>{
    const id=req.params.id;
    console.log(id);
    const numint=Number(id);
    if(!id){
        return res.status(200).json({message:"No id found"});
    }
    const notification=await prisma.notification.findMany({
        where:{
            user_id:numint
        }
    })
    return res.status(200).json({notification});

})
export const notificationrouter=router;
