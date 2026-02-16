import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import { prisma } from "./prismaClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ABI
const abi = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/TrustChainAbi.json"), "utf-8")
);

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Fix BigInt serialization middleware
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    return oldJson.call(
      this,
      JSON.parse(
        JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
      )
    );
  };
  next();
});

// Simple health check
app.get("/", (req, res) => res.send("SERVER WORKING"));

// ---------- BLOCKCHAIN SETUP ----------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// ---------- MANUFACTURER ROUTES ----------

// Stats
app.get("/api/manufacturer/stats", async (req, res) => {
  try {
    const totalBatches = await prisma.batch.count();
    const totalProducts = await prisma.product.count();
    const totalShipped = await prisma.product.count({ where: { shipped: true } });

    // Blockchain transactions = total batches registered + total batches shipped
    const totalTransactions = totalBatches + totalShipped;

    res.json({ totalBatches, totalProducts, totalShipped, totalTransactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Recent activity
app.get("/api/manufacturer/activity", async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const activity = batches.map((b) => ({
      message: `${b.batchId} (${b.batchSize} products) ${b.shipped ? "shipped" : "registered"}`,
      createdAt: b.createdAt
    }));

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all batches
app.get("/api/manufacturer/batches", async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({ orderBy: { createdAt: "desc" } });
    res.json(batches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Prepare batch (returns array of products for blockchain)
app.post("/api/manufacturer/prepare-batch", async (req, res) => {
  try {
    const batch = req.body;
    if (!batch.batchId || !batch.boxId || !batch.batchSize)
      return res.status(400).json({ message: "Invalid batch data" });

    const items = [];
    for (let i = 0; i < batch.batchSize; i++) {
      items.push({
        productId: `${batch.batchId}-${i + 1}`,
        boxId: batch.boxId,
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
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Register batch in DB + Blockchain
app.post("/api/manufacturer/register", async (req, res) => {
  try {
    const batch = req.body;

    // Save in database
    await prisma.batch.create({
      data: {
        batchId: batch.batchId,
        boxId: batch.boxId,
        batchSize: parseInt(batch.batchSize),
        manufacturer: batch.manufacturer,
        manufacturerDate: batch.manufacturerDate,
        manufacturePlace: batch.manufacturePlace,
        modelNumber: batch.modelNumber,
        color: batch.color,
        price: BigInt(batch.price),
        shipped: false
      }
    });

    // Save products individually
    for (let i = 0; i < batch.batchSize; i++) {
      await prisma.product.create({
        data: {
          productId: `${batch.batchId}-${i + 1}`,
          boxId: batch.boxId,
          name: batch.name,
          category: batch.category,
          manufacturer: batch.manufacturer,
          manufacturerDate: batch.manufacturerDate,
          manufacturePlace: batch.manufacturePlace,
          modelNumber: batch.modelNumber,
          serialNumber: `${batch.batchId}-${i + 1}`,
          warrantyPeriod: batch.warrantyPeriod,
          batchNumber: batch.batchId,
          color: batch.color,
          specs: JSON.stringify({}),
          price: BigInt(batch.price),
          image: batch.image,
          shipped: false
        }
      });
    }

    // Blockchain transaction
    const items = [];
    for (let i = 0; i < batch.batchSize; i++) {
      items.push({
        productId: `${batch.batchId}-${i + 1}`,
        boxId: batch.boxId,
        name: batch.name,
        category: batch.category,
        manufacturer: batch.manufacturer,
        manufacturerDate: batch.manufacturerDate,
        manufacturePlace: batch.manufacturePlace,
        modelNumber: batch.modelNumber,
        serialNumber: `${batch.batchId}-${i + 1}`,
        warrantyPeriod: batch.warrantyPeriod,
        batchNumber: batch.batchId,
        color: batch.color,
        specs: JSON.stringify({}),
        price: BigInt(batch.price),
        image: batch.image
      });
    }

    const tx = await contract.registerBatchProducts(batch.batchId, batch.boxId, items);
    await tx.wait();

    res.json({ message: "Batch registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Ship batch in DB + Blockchain
app.post("/api/manufacturer/ship", async (req, res) => {
  try {
    const { batchId } = req.body;

    // Update batch
    await prisma.batch.update({
      where: { batchId },
      data: { shipped: true }
    });

    // Update products
    await prisma.product.updateMany({
      where: { batchNumber: batchId },
      data: { shipped: true }
    });

    // Blockchain transaction
    const tx = await contract.shipBox(batchId);
    await tx.wait();

    res.json({ message: "Batch shipped successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
