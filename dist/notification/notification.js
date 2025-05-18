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
const prisma = new client_1.PrismaClient();
const router = (0, express_1.default)();
router.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, Name, Mobile_No } = req.body;
    console.log(email);
    if (!email || !Name || !Mobile_No) {
        return res.status(400).json({ message: "Kindly fill all the details" });
    }
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
    const { id, data } = req.body;
    if (!data || !id) {
        return res.status(400).json({ message: "Fill all the details" });
    }
    console.log("checke");
    const modify = Number(id);
    const existing = yield prisma.user.findUnique({
        where: {
            id: modify
        }
    });
    console.log("Dasds");
    if (!existing) {
        return res.status(440).json({ message: "user not found" });
    }
    (0, email_1.sendemail)(existing.email, data);
    const notification = yield prisma.notification.create({
        data: {
            Content: data,
            user_id: id
        }
    });
    return res.status(200).json({ message: "Notification processed", notification });
}));
router.get("/not", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findMany({});
    return res.status(200).json({ user });
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
