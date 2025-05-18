"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_1 = require("./notification/notification");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use("/api/v1", notification_1.notificationrouter);
app.use(express_1.default.json());
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
