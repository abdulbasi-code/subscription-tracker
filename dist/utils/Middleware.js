"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const auth_1 = require("./auth");
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!(auth === null || auth === void 0 ? void 0 : auth.startsWith("Bearer ")))
        return res.status(401).json({ error: "No token" });
    const token = auth.split(" ")[1];
    try {
        const decoded = (0, auth_1.verifyToken)(token);
        req.userId = decoded.userId;
        next();
    }
    catch (_a) {
        res.status(401).json({ error: "Invalid token" });
    }
}
