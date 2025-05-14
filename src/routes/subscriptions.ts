// @ts-nocheck
import express from "express";
import { prisma } from "../utils/prisma";
import { authMiddleware } from "../utils/Middleware";

const router = express.Router();

router.post("/subscriptions", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { name, price, billingCycle, nextPayment, color } = req.body;

  try {
    const subscription = await prisma.subscription.create({
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
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.get("/subscriptions", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ subscriptions: user.subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.patch("/subscriptions/:id", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const id = req.params.id;
  const { name, price, billingCycle, nextPayment, color } = req.body;

  try {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.userId !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseFloat(price) }),
        ...(billingCycle && { billingCycle }),
        ...(nextPayment && { nextPayment: new Date(nextPayment) }),
        ...(color && { color }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Failed to update" });
  }
});

router.delete("/subscriptions/:id", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const id = req.params.id;

  try {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.userId !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.subscription.delete({ where: { id } });
    res.json({ message: "Subscription deleted" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
