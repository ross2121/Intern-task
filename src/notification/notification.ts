import {PrismaClient} from "@prisma/client"
import Router from "express"
import { sendemail } from "../Push_notification/email";
import { sendSMS } from "../Push_notification/sms";
import { Kafka } from "kafkajs"
import { z } from "zod";
const prisma = new PrismaClient();
const router = Router();
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'notification-group' });
async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notifications', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const notification = JSON.parse(message.value?.toString() || '');
        const { email, mobileNo, content, userId } = notification;
        await Promise.all([
          sendemail(email, content),
          sendSMS(mobileNo, content)
        ]);
        await prisma.notification.create({
          data: {
            Content: content,
            user_id: userId
          }
        });
        console.log('Notification processed successfully');
      } catch (error) {
        console.error('Failed to process notification:', error);
        await producer.send({
          topic: 'notifications',
          messages: [{ value: message.value }]
        });
      }
    },
  });
}
startConsumer().catch(console.error);
router.post("/user", async (req: any, res: any) => {
    const userSchema = z.object({
        email: z.string().email(),
        Name: z.string().min(1),
        Mobile_No: z.string().min(1)
    });
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: parseResult.error.errors });
    }
    const { email, Name, Mobile_No } = parseResult.data;
    const user = await prisma.user.create({
        data: {
            email,
            Name,
            Mobile_No
        }
    });
    return res.status(200).json({ message: "User created", user });
});
router.post("/notifications", async (req: any, res: any) => {
    const notificationSchema = z.object({
        id: z.union([z.string(), z.number()]),
        data: z.string().min(1)
    });
    const parseResult = notificationSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: parseResult.error.errors });
    }
    const { id, data } = parseResult.data;
    if (!data || !id) {
        return res.status(400).json({ message: "Fill all the details" });
    }

    const modify = Number(id);
    const existing = await prisma.user.findUnique({
        where: {
            id: modify
        }
    });

    if (!existing) {
        return res.status(404).json({ message: "user not found" });
    }

    try {
        await producer.connect();
        await producer.send({
            topic: 'notifications',
            messages: [{
                value: JSON.stringify({
                    email: existing.email,
                    mobileNo: existing.Mobile_No,
                    content: data,
                    userId: id
                })
            }]
        });

        return res.status(200).json({ message: "Notification queued for processing" });
    } catch (error) {
        console.error('Failed to queue notification:', error);
        return res.status(500).json({ message: "Failed to process notification" });
    }
});
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
export const notificationrouter = router;
