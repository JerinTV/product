// src/trustChain.js

import { ethers } from "ethers";
import TrustChainAbi from "./TrustChainAbi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!CONTRACT_ADDRESS) throw new Error("❌ VITE_CONTRACT_ADDRESS not set in .env");

let provider = null;
let signer = null;
let contract = null;

// ---------------- CONNECT METAMASK ----------------
export const connectBlockchain = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, TrustChainAbi, signer);

  console.log("✅ Connected to blockchain");
};

// ---------------- REGISTER BATCH ----------------
export const registerBatch = async (batch) => {
  try {
    // 1️⃣ Prepare batch from backend
    const token = localStorage.getItem("token") || "";
    const res = await fetch(`${BACKEND_URL}/api/manufacturer/prepare-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(batch),
    });

    if (!res.ok) throw new Error(await res.text());
    const { items } = await res.json(); // [{ productId: "P1000" }, ...]

    // 2️⃣ Connect blockchain if needed
    if (!contract) await connectBlockchain();

    // 3️⃣ Extract productIds as strings
    const productIds = items.map((i) => String(i.productId));

    // 4️⃣ Prepare tuple for Solidity struct
    // Solidity: struct Batch { string batchId; string boxId; string[] productIds; }
    const batchTuple = [
      String(batch.batchId), // batchId
      String(batch.boxId),   // boxId
      productIds             // array of productIds
    ];

    console.log("Registering batch on chain:", batchTuple);

    // 5️⃣ Call contract
    const tx = await contract.registerBatchProducts(batchTuple);
    await tx.wait();

    console.log("🏭 Batch registered on blockchain successfully");

    return items;
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    throw err;
  }
};

// ---------------- SHIP BATCH ----------------
export const shipBox = async (batchId) => {
  try {
    if (!contract) await connectBlockchain();
    const tx = await contract.shipBox(String(batchId));
    await tx.wait();
    console.log("📦 Batch shipped on blockchain");
  } catch (err) {
    console.error("SHIP ERROR:", err);
    throw err;
  }
};

// ---------------- VERIFY RETAILER ----------------
export const verifyRetailer = async (productId) => {
  try {
    if (!contract) await connectBlockchain();
    const tx = await contract.verifyRetailer(String(productId));
    await tx.wait();
    console.log("✅ Product verified by retailer");
  } catch (err) {
    console.error("VERIFY RETAILER ERROR:", err);
    throw err;
  }
};

// ---------------- SALE COMPLETE ----------------
export const saleComplete = async (productId) => {
  try {
    if (!contract) await connectBlockchain();
    const tx = await contract.saleComplete(String(productId));
    await tx.wait();
    console.log("💰 Sale complete");
  } catch (err) {
    console.error("SALE COMPLETE ERROR:", err);
    throw err;
  }
};

// ---------------- GET PRODUCT INFO ----------------
export const getProduct = async (productId) => {
  try {
    if (!contract) await connectBlockchain();
    const p = await contract.getProduct(String(productId));

    return {
      productId: p.productId,
      boxId: p.boxId,
      name: p.name,
      category: p.category,
      manufacturer: p.manufacturer,
      manufacturerDate: p.manufacturerDate,
      manufacturePlace: p.manufacturePlace,
      modelNumber: p.modelNumber,
      serialNumber: p.serialNumber,
      warrantyPeriod: p.warrantyPeriod,
      batchNumber: p.batchNumber,
      color: p.color,
      specs: p.specs,
      price: p.price.toString(),
      image: p.image,
      shipped: p.shipped,
      verifiedByRetailer: p.verifiedByRetailer,
      verifiedBySystem: p.verifiedBySystem,
      sold: p.sold,
    };
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    throw err;
  }
};

// ---------------- GET PRODUCT IDS BY BOX ----------------
export const getProductIdsByBox = async (boxId) => {
  try {
    if (!contract) await connectBlockchain();
    const ids = await contract.getProductsByBox(String(boxId));
    return ids.map((id) => String(id));
  } catch (err) {
    console.error("GET PRODUCT IDS ERROR:", err);
    throw err;
  }
};
