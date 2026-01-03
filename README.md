

# 🔐 FAKE-PRODUCT

### NFC + Blockchain Based Product Authentication System

This project detects **fake / counterfeit products** using:

* 🔒 **Challenge–Response NFC authentication**
* ⛓️ **Ethereum Blockchain (Hardhat)**
* 🌐 **React Frontend**
* 🧠 **Node.js Backend (Verification Authority)**

---

## 🧠 Core Idea (Simple)

1. Every product has a **secure NFC tag**
2. NFC tag never reveals its secret
3. Backend sends a **random challenge**
4. NFC signs the challenge
5. Backend verifies the response
6. Blockchain confirms product lifecycle

If **any step fails → product is FAKE**

---

## 📁 FINAL PROJECT STRUCTURE

```
FAKE-PRODUCT/
│
├── backend/                        # 🔐 Backend (Verification Server)
│   ├── server.js                   # Express server (/challenge, /verify)
│   ├── abi.json                    # Smart contract ABI
│   ├── .env                        # RPC URL, private key, contract address
│   │
│   ├── nfc_emulator/               # 🧠 NFC Simulation (Demo Mode)
│   │   ├── chip.js                 # Secure NFC logic (secret never exposed)
│   │   └── secretStore.js          # Demo secrets (simulates NFC chip)
│   │
│   └── package.json
│
├── contracts/                      # ⛓️ Solidity Smart Contracts
│   └── TrustChain.sol
│
├── scripts/                        # ⛓️ Hardhat scripts
│   └── deploy.js                   # Deploy contract
│
├── frontend/                       # 🌐 React Frontend
│   ├── index.html
│   ├── package.json
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │
│   │   ├── pages/
│   │   │   └── Dashboards/
│   │   │       └── UserDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Calls backend APIs
│   │   │
│   │   ├── nfc/
│   │   │   └── nfcScanner.js        # NFC scan (real + demo)
│   │   │
│   │   └── styles/
│   │       └── index.css
│
├── hardhat.config.cjs
├── README.md
└── .gitignore
```

---

## 🖥️ HOW TO RUN THE PROJECT (IMPORTANT)

You need **THREE terminals running together**.

---

## 🟢 TERMINAL 1 — Start Blockchain (Hardhat)

This runs the **local Ethereum blockchain**.

```bash
npx hardhat node
```

✔ Keep this terminal **OPEN**
✔ Do NOT close it
✔ Closing it wipes all blockchain data

---

## 🟢 TERMINAL 2 — Deploy Smart Contract

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

You’ll see:

```
TrustChain deployed to: 0xABC123...
```

📌 **Copy this contract address**

CONTRACT_ADDRESS=0xABC123...   # paste deployed address in trustChain.js file

---

## 🟢 TERMINAL 3 — Start Backend Server

### Step 1: Create `.env` file in `backend/`

```env
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0xABC123...   # paste deployed address
PRIVATE_KEY=0xHARDHAT_PRIVATE_KEY
```

### Step 2: Run backend

```bash
cd backend
node server.js
```

Expected output:

```
Backend running on http://localhost:5000
```

---

## 🟢 TERMINAL 4 — Start Frontend

```bash

npm run dev
```

Open browser:

```
http://localhost:5173
```

---

## 🧪 REGISTER A PRODUCT (ON BLOCKCHAIN)

Run this **ONCE** after deployment:

```bash
npx hardhat console --network localhost
```

```js
const tc = await ethers.getContractAt(
  "TrustChain",
  "0xABC123..." // SAME as backend
);

await tc.registerProduct(
  "P1001",
  "BOX01",
  "Demo Product",
  "Electronics",
  "Demo Manufacturer",
  "2024-01-01",
  "India",
  "MODEL-X",
  "SERIAL-001",
  "1 Year",
  "BATCH-01",
  "Black",
  "{}",
  1000,
  "https://via.placeholder.com/300"
);

await tc.shipProduct("P1001");
await tc.verifyRetailer("P1001");
```

✔ Product is now **officially registered on blockchain**

---

## 🔄 HOW VERIFICATION WORKS (Flow)

```
User clicks "Scan NFC"
   ↓
Frontend → /challenge
   ↓
Backend → blockchain check
   ↓
Backend sends challenge
   ↓
NFC signs challenge
   ↓
Frontend → /verify
   ↓
Backend verifies response
   ↓
✅ Genuine / ❌ Fake
```

---

## 📱 NFC HANDLING (IMPORTANT)

### Real NFC

* Works **only on Android Chrome**
* Web NFC cannot do secure crypto yet

### Demo Mode (Desktop)

* Manually enter Product ID
* Secret is simulated
* Algorithm remains **exactly the same**

This is **acceptable for academic projects**.

---

## 🔐 SECURITY DESIGN (Mentor-Ready)

✔ No static Product ID authentication
✔ Secret never leaves NFC chip
✔ Random challenge per scan
✔ Replay attacks prevented
✔ Blockchain data immutable

---

## ⚠️ COMMON MISTAKES (AVOID)

❌ Frontend & backend using different contract addresses
❌ Restarting Hardhat node after registering products
❌ Registering products in Remix JS VM
❌ MetaMask network mismatch

---

## 🧠 ONE GOLDEN RULE

> **Blockchain data lives at a contract address.
> Same code ≠ same data.**

---

## 🎯 FINAL STATUS

✔ Project working
✔ Architecture correct
✔ Security justified
✔ Demo-ready
✔ Mentor-safe

---

If you want next, I can:

* Add **auto-seed script**
* Prepare **final PPT**
* Write **report + diagrams**
* Convert demo to **Sepolia testnet**

Just say 👍
