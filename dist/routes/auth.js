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
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../utils/auth");
const Middleware_1 = require("../utils/Middleware");
const router = express_1.default.Router();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Missing fields" });
    const existingUser = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser)
        return res.status(409).json({ error: "Email already exists" });
    const passwordHash = yield bcrypt_1.default.hash(password, 10);
    const user = yield prisma_1.prisma.user.create({
        data: { email, passwordHash },
    });
    const token = (0, auth_1.generateToken)(user.id);
    res.json({ token, user: { id: user.id, email: user.email } });
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: "Invalid credentials" });
    const valid = yield bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ error: "Invalid credentials" });
    const token = (0, auth_1.generateToken)(user.id);
    res.json({ token, user: { id: user.id, email: user.email } });
}));
router.get("/user", Middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
    });
    res.json({ user });
}));
exports.default = router;
