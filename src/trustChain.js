import { ethers } from "ethers";
import TrustChainAbi from "./TrustChainAbi.json";

// <-- replace this with your deployed contract address if different -->
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ---------- PROVIDER ----------
const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new ethers.BrowserProvider(window.ethereum);
};

// ---------- CONTRACT ----------
const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, TrustChainAbi, signer);
};

// ---------- WALLET ----------
export const connectBlockchain = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  console.log("✅ Wallet connected");
};

// ---------- REGISTER ----------
export const registerProduct = async (product) => {
  const contract = await getContract();

  // Ensure specs is always a string
  const specsString = JSON.stringify(product.specs || {});

  const tx = await contract.registerProduct(
    product.productId,
    product.boxId,
    product.name,
    product.category,
    product.manufacturer,
    product.manufacturerDate,
    product.manufacturePlace,
    product.modelNumber,
    product.serialNumber,
    product.warrantyPeriod,
    product.batchNumber,
    product.color,
    specsString,
    BigInt(product.price),
    product.image
  );

  await tx.wait();
  console.log("✅ Product Registered");
};

// ---------- SHIP ----------
export const shipProduct = async (productId) => {
  const contract = await getContract();
  const tx = await contract.shipProduct(productId);
  await tx.wait();
  console.log("✅ Shipped:", productId);
};

// ---------- GET PRODUCTS BY BOX ----------
export const getProductIdsByBox = async (boxId) => {
  const contract = await getContract();
  const ids = await contract.getProductsByBox(boxId);
  // ensure returned array is normal JS array of strings
  return ids.map(x => x.toString());
};

// ---------- VERIFY ----------
export const verifyRetailer = async (productId) => {
  const contract = await getContract();
  const tx = await contract.verifyRetailer(productId);
  await tx.wait();
  console.log("✅ Verified:", productId);
};

// ---------- SELL ----------
export const saleComplete = async (productId) => {
  const contract = await getContract();
  const tx = await contract.saleComplete(productId);
  await tx.wait();
  console.log("✅ Sold:", productId);
};

// ---------- ADMIN: set/get secret ----------
export const setProductSecret = async (productId, secret) => {
  const contract = await getContract();
  const tx = await contract.setProductSecret(productId, secret);
  await tx.wait();
  console.log("✅ Secret set for:", productId);
};

export const getProductSecret = async (productId) => {
  const contract = await getContract();
  const secret = await contract.getProductSecret(productId);
  return secret.toString();
};

// ---------- FETCH PRODUCT ----------
export const getProduct = async (productId) => {
  const contract = await getContract();
  const p = await contract.getProduct(productId);

  let parsedSpecs = {};
  try {
    parsedSpecs = p.specs ? JSON.parse(p.specs) : {};
  } catch {
    parsedSpecs = {};
  }

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
    specs: parsedSpecs,
    price: p.price ? p.price.toString() : "0",
    image: p.image || "",
    shipped: Boolean(p.shipped),
    verifiedByRetailer: Boolean(p.verifiedByRetailer),
    sold: Boolean(p.sold)
  };
};
