"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationrouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const email_1 = require("../Push_notification/email");
const sms_1 = require("../Push_notification/sms");
const kafkajs_1 = require("kafkajs");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.default)();
const kafka = new kafkajs_1.Kafka({
    clientId: 'notification-service',
    brokers: ['localhost:9092']
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'notification-group' });
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield consumer.connect();
        yield consumer.subscribe({ topic: 'notification', fromBeginning: true });
        yield consumer.run({
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ message }) {
                var _b;
                try {
                    const notification = JSON.parse(((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString()) || '');
                    const { email, mobileNo, content, userId } = notification;
                    yield Promise.all([
                        (0, email_1.sendemail)(email, content),
                        (0, sms_1.sendSMS)(mobileNo, content)
                    ]);
                    yield prisma.notification.create({
                        data: {
                            Content: content,
                            user_id: userId
                        }
                    });
                    console.log('Notification processed successfully');
                }
                catch (error) {
                    console.error('Failed to process notification:', error);
                    yield producer.send({
                        topic: 'notifications',
                        messages: [{ value: message.value }]
                    });
                }
            }),
        });
    });
}
startConsumer().catch(console.error);
router.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userSchema = zod_1.z.object({
        email: zod_1.z.string().email(),
        Name: zod_1.z.string().min(1),
        Mobile_No: zod_1.z.string().min(1)
    });
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: parseResult.error.errors });
    }
    const { email, Name, Mobile_No } = parseResult.data;
    const user = yield prisma.user.create({
        data: {
            email,
            Name,
            Mobile_No
        }
    });
    return res.status(200).json({ message: "User created", user });
}));
router.post("/notifications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationSchema = zod_1.z.object({
        id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
        data: zod_1.z.string().min(1)
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
    const existing = yield prisma.user.findUnique({
        where: {
            id: modify
        }
    });
    if (!existing) {
        return res.status(404).json({ message: "user not found" });
    }
    try {
        yield producer.connect();
        yield producer.send({
            topic: 'notification',
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
    }
    catch (error) {
        console.error('Failed to queue notification:', error);
        return res.status(500).json({ message: "Failed to process notification" });
    }
}));
router.get("/notification/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    const numint = Number(id);
    if (!id) {
        return res.status(200).json({ message: "No id found" });
    }
    const notification = yield prisma.notification.findMany({
        where: {
            user_id: numint
        }
    });
    return res.status(200).json({ notification });
}));
exports.notificationrouter = router;
