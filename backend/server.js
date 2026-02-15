import cors from "cors";
import express from "express";
import crypto from "crypto";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { signChallenge } from "./nfc_emulator/chip.js";
import { prisma } from "./prismaClient.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

/* ================= PATH ================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= LOAD ABI ================= */

const abi = JSON.parse(
  fs.readFileSync(path.join(__dirname, "abi.json"), "utf-8")
);

/* ================= EXPRESS ================= */

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

/* ================= BIGINT FIX ================= */

app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    return oldJson.call(
      this,
      JSON.parse(
        JSON.stringify(data, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      )
    );
  };
  next();
});

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("SERVER WORKING");
});

/* ================= BLOCKCHAIN ================= */

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

/* ================= CHALLENGE STORE ================= */

const activeChallenges = new Map();

function generateChallenge() {
  return crypto.randomBytes(8).toString("hex");
}

/* =====================================================
   MANUFACTURER ROUTES
===================================================== */

/* ---------- STATS ---------- */
app.get("/api/manufacturer/stats", async (req, res) => {
  try {
    const totalBatches = await prisma.batch.count();
    const totalProducts = await prisma.product.count();
    const totalShipped = await prisma.product.count({
      where: { shipped: true }
    });

    res.json({
      totalBatches,
      totalProducts,
      totalShipped,
      totalTransactions: totalShipped
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------- ACTIVITY ---------- */
app.get("/api/manufacturer/activity", async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const activity = batches.map((b) => ({
      message: `Batch ${b.batchId} registered`,
      createdAt: b.createdAt
    }));

    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------- BATCHES ---------- */
app.get("/api/manufacturer/batches", async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   PREPARE BATCH  ✅ FIXED
===================================================== */

app.post("/api/manufacturer/prepare-batch", async (req, res) => {
  try {
    const batch = req.body;

    if (!batch?.batchId || !batch?.boxId || !batch?.batchSize) {
      return res.status(400).json({ message: "Invalid batch data" });
    }

    const items = [];

     for (let i = 0; i < batch.batchSize; i++) {
      items.push({
        productId: `${batch.batchId}-${i + 1}`,
        boxId: batch.boxId,                     // ✅ REQUIRED
        name: batch.name || "",
        category: batch.category || "",
        manufacturer: batch.manufacturer || "",
        manufacturerDate: batch.manufacturerDate || "",
        manufacturePlace: batch.manufacturePlace || "",
        modelNumber: batch.modelNumber || "",
        serialNumber: `${batch.batchId}-${i + 1}`,
        warrantyPeriod: batch.warrantyPeriod || "",
        batchNumber: batch.batchId,
        color: batch.color || "",
        specs: JSON.stringify({}),
        price: BigInt(batch.price || 0),
        image: batch.image || ""
      });
    }

    res.json({ items });

  } catch (err) {
    console.error("Prepare batch error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   REGISTER BATCH
===================================================== */

app.post("/api/manufacturer/register", async (req, res) => {
  try {
    const {
      batchId,
      boxId,
      batchSize,
      manufacturer,
      manufacturerDate,
      manufacturePlace,
      modelNumber,
      color,
      price
    } = req.body;

    await prisma.batch.create({
      data: {
        batchId,
        boxId,
        batchSize: parseInt(batchSize),
        manufacturer,
        manufacturerDate,
        manufacturePlace,
        modelNumber,
        color,
        price: BigInt(price),
        shipped: false
      }
    });

    res.json({ message: "Batch registered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------- SHIP ---------- */
app.post("/api/manufacturer/ship", async (req, res) => {
  try {
    const { batchId } = req.body;

    await prisma.batch.update({
      where: { batchId },
      data: { shipped: true }
    });

    res.json({ message: "Batch shipped" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   START
===================================================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
