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
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../utils/prisma");
const Middleware_1 = require("../utils/Middleware");
const router = express_1.default.Router();
router.post("/subscriptions", Middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { name, price, billingCycle, nextPayment, color } = req.body;
    try {
        const subscription = yield prisma_1.prisma.subscription.create({
            data: {
                name,
                price: parseFloat(price),
                billingCycle,
                nextPayment: new Date(nextPayment),
                userId,
                color: color || "#000000",
            },
        });
        res.status(201).json(subscription);
    }
    catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
}));
router.get("/subscriptions", Middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { subscriptions: true },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json({ subscriptions: user.subscriptions });
    }
    catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
}));
router.patch("/subscriptions/:id", Middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const id = req.params.id;
    const { name, price, billingCycle, nextPayment, color } = req.body;
    try {
        const sub = yield prisma_1.prisma.subscription.findUnique({ where: { id } });
        if (!sub || sub.userId !== userId)
            return res.status(403).json({ error: "Unauthorized" });
        const updated = yield prisma_1.prisma.subscription.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (price && { price: parseFloat(price) })), (billingCycle && { billingCycle })), (nextPayment && { nextPayment: new Date(nextPayment) })), (color && { color })),
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json({ error: "Failed to update" });
    }
}));
router.delete("/subscriptions/:id", Middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const id = req.params.id;
    try {
        const sub = yield prisma_1.prisma.subscription.findUnique({ where: { id } });
        if (!sub || sub.userId !== userId)
            return res.status(403).json({ error: "Unauthorized" });
        yield prisma_1.prisma.subscription.delete({ where: { id } });
        res.json({ message: "Subscription deleted" });
    }
    catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json({ error: "Failed to delete" });
    }
}));
exports.default = router;
