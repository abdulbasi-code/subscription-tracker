// @ts-nocheck
import express from "express";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/auth";
import { authMiddleware } from "../utils/Middleware";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});

router.get("/user", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  res.json({ user });
});

export default router;
