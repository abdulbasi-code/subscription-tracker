import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import subscriptionRoutes from "./routes/subscriptions";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Subscription Tracker API");
});

app.use(authRoutes);
app.use(subscriptionRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
