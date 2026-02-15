import { ethers } from "ethers";
import TrustChainAbi from "./TrustChainAbi.json";

/* ================= CONFIG ================= */
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!CONTRACT_ADDRESS) throw new Error("❌ VITE_CONTRACT_ADDRESS not set in .env");
if (!BACKEND_URL) throw new Error("❌ VITE_BACKEND_URL not set in .env");

/* ================= CACHE ================= */
let provider = null;
let signer = null;
let contract = null;

/* ================= PROVIDER ================= */
const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
};

/* ================= SIGNER ================= */
const getSigner = async () => {
  if (!signer) signer = await getProvider().getSigner();
  return signer;
};

/* ================= CONTRACT ================= */
const getContract = async () => {
  if (!contract) contract = new ethers.Contract(CONTRACT_ADDRESS, TrustChainAbi, await getSigner());
  return contract;
};

/* ================= WALLET CONNECT ================= */
export const connectBlockchain = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  console.log("✅ Wallet connected:", accounts[0]);
  return accounts[0];
};

/* ================= BATCH REGISTER ================= */
export const registerBatch = async (batch) => {
  console.log("🏭 Registering batch:", batch.batchId);

  // 1️⃣ Prepare batch via backend
  const token = localStorage.getItem("token") || ""; // optional auth token
  const res = await fetch(`${BACKEND_URL}/api/manufacturer/prepare-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(batch)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Prepare batch failed: " + text);
  }

  const { items } = await res.json();

  // 2️⃣ Blockchain transaction
  const c = await getContract();
  const tx = await c.registerBatchProducts(batch.batchId, batch.boxId, items);
  await tx.wait();

  console.log("✅ Batch registered on blockchain");
};

/* ================= SHIP BOX ================= */
export const shipBox = async (boxId) => {
  const c = await getContract();
  const tx = await c.shipBox(boxId);
  await tx.wait();
  console.log("📦 Box shipped:", boxId);
};

/* ================= GET PRODUCT IDS ================= */
export const getProductIdsByBox = async (boxId) => {
  const c = await getContract();
  const ids = await c.getProductsByBox(boxId);
  return ids.map((id) => id.toString());
};

/* ================= VERIFY & SALE ================= */
export const verifyRetailer = async (productId) => {
  const c = await getContract();
  const tx = await c.verifyRetailer(productId);
  await tx.wait();
  console.log("✅ Retailer verified:", productId);
};

export const verifyBySystem = async (productId) => {
  const c = await getContract();
  const tx = await c.verifyBySystem(productId);
  await tx.wait();
  console.log("🛡️ System verified:", productId);
};

export const saleComplete = async (productId) => {
  const c = await getContract();
  const tx = await c.saleComplete(productId);
  await tx.wait();
  console.log("💰 Sold:", productId);
};

/* ================= GET PRODUCT DETAILS ================= */
export const getProduct = async (productId) => {
  const c = await getContract();
  const p = await c.getProduct(productId);

  return {
    productId: p.productId || "",
    boxId: p.boxId || "",
    name: p.name || "",
    category: p.category || "",
    manufacturer: p.manufacturer || "",
    manufacturerDate: p.manufacturerDate || "",
    manufacturePlace: p.manufacturePlace || "",
    modelNumber: p.modelNumber || "",
    serialNumber: p.serialNumber || "",
    warrantyPeriod: p.warrantyPeriod || "",
    batchNumber: p.batchNumber || "",
    color: p.color || "",
    specs: p.specs ? JSON.parse(p.specs) : {},
    price: p.price ? p.price.toString() : "0",
    image: p.image || "",
    shipped: Boolean(p.shipped),
    verifiedByRetailer: Boolean(p.verifiedByRetailer),
    verifiedBySystem: Boolean(p.verifiedBySystem),
    sold: Boolean(p.sold)
  };
};
