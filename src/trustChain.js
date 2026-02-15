import { ethers } from "ethers";
import TrustChainAbi from "./TrustChainAbi.json";
import CryptoJS from "crypto-js";

/* ================= CONFIG ================= */

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/* ================= PROVIDER ================= */

const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new ethers.BrowserProvider(window.ethereum);
};

/* ================= CONTRACT ================= */

const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = getProvider();
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, TrustChainAbi, signer);
};

/* ================= WALLET ================= */

export const connectBlockchain = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  console.log("✅ Wallet connected");
};

/* ================= BACKEND SECRET STORAGE ================= */

const storeSecretInBackend = async (productId, secret) => {
  await fetch("http://localhost:5000/store-secret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, secret })
  });
};

/* ================= SECRET HELPERS ================= */

const generateBatchSecret = () => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

const deriveProductSecret = (batchSecret, productId) => {
  return CryptoJS.SHA256(batchSecret + productId).toString();
};

/* ================= ⭐ BATCH REGISTER (PRODUCTION) ================= */

export const registerBatch = async (batch) => {
  console.log("🏭 Registering batch:", batch.batchId);

  const contract = await getContract();

  // 1️⃣ Generate batch secret (OFF-CHAIN)
  const batchSecret = generateBatchSecret();
  console.log("🔐 Batch secret generated");

  const startNum = parseInt(batch.startProductId.replace(/\D/g, ""), 10);

  const items = [];

  // 2️⃣ Prepare batch payload
  for (let i = 0; i < batch.batchSize; i++) {
    const productId = `P${startNum + i}`;
    const serialNumber = `${batch.batchId}-SN-${i + 1}`;

    const productSecret = deriveProductSecret(batchSecret, productId);

    // store secret in backend DB (JSON)
    await storeSecretInBackend(productId, productSecret);

    items.push({
      productId,
      boxId: batch.boxId,
      name: batch.name,
      category: batch.category,
      manufacturer: batch.manufacturer,
      manufacturerDate: batch.manufacturerDate,
      manufacturePlace: batch.manufacturePlace,
      modelNumber: batch.modelNumber,
      serialNumber,
      warrantyPeriod: batch.warrantyPeriod,
      batchNumber: batch.batchId,
      color: batch.color,
      specs: JSON.stringify({ batch: batch.batchId }),
      price: BigInt(batch.price),
      image: batch.image
    });

    console.log("🔐 NFC secret stored for:", productId);
  }

  // 3️⃣ SINGLE blockchain transaction ✅
  const tx = await contract.registerBatchProducts(
    batch.batchId,
    batch.boxId,
    items
  );

  await tx.wait();

  console.log("✅ Batch registered on blockchain (ONE TX)");
};

/* ================= SHIP ================= */

export const shipBox = async (boxId) => {
  const contract = await getContract();
  const tx = await contract.shipBox(boxId);
  await tx.wait();
  console.log("📦 Box shipped:", boxId);
};


/* ================= BOX QUERY ================= */

export const getProductIdsByBox = async (boxId) => {
  const contract = await getContract();
  const ids = await contract.getProductsByBox(boxId);
  return ids.map(id => id.toString());
};

/* ================= RETAILER VERIFY ================= */

export const verifyRetailer = async (productId) => {
  const contract = await getContract();
  const tx = await contract.verifyRetailer(productId);
  await tx.wait();
  console.log("✅ Retailer verified:", productId);
};

/* ================= SALE ================= */

export const saleComplete = async (productId) => {
  const contract = await getContract();
  const tx = await contract.saleComplete(productId);
  await tx.wait();
  console.log("💰 Sold:", productId);
};

/* ================= FETCH PRODUCT ================= */

export const getProduct = async (productId) => {
  const contract = await getContract();
  const p = await contract.getProduct(productId);

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
    sold: Boolean(p.sold)
  };
};
