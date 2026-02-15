import { useEffect, useState } from "react";
import "../../index3.css";

/* ===== BACKEND API ===== */
import {
  getStats,
  getActivity,
  getBatches,
  registerBatch as registerBatchDB,
  shipBatch
} from "../../services/api";

/* ===== BLOCKCHAIN ===== */
import {
  registerBatch as registerBatchChain
} from "../../trustChain";

export default function Manufacturer() {

  const [activeTab, setActiveTab] = useState("register");
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [batches, setBatches] = useState([]);
  const [account, setAccount] = useState(null);
  const [search, setSearch] = useState("");

  /* ================= FORM DATA ================= */

  const [formData, setFormData] = useState({
    batchId: "BATCH-001",
    boxId: "BOX-001",
    batchSize: 10,
    startProductId: "P1000",

    name: "TrustChain Device",
    category: "Electronics",
    warrantyPeriod: "1 Year",
    image: "product.png",

    manufacturer: "TrustChain Pvt Ltd",
    manufacturerDate: new Date().toISOString().split("T")[0],
    manufacturePlace: "Bangalore",
    modelNumber: "TC-2026-X",
    serialPrefix: "SN",
    color: "Black",
    price: 4999
  });

  /* ================= LOAD DASHBOARD ================= */

  const loadDashboard = async () => {
    try {
      const s = await getStats();
      const a = await getActivity();
      const b = await getBatches();

      setStats(s);
      setActivity(a);
      setBatches(b);
    } catch (e) {
      console.error("Dashboard load error:", e);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ================= METAMASK ================= */

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      setAccount(accounts[0]);
    } catch (e) {
      console.error("Wallet connect error:", e);
    }
  };

  /* ================= FORM ================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value
    });
  };

  /* ================= REGISTER ================= */

  const handleRegister = async () => {
    if (!account) return alert("Connect Wallet First");

    try {
      /* 1️⃣ BLOCKCHAIN (MetaMask TX) */
      await registerBatchChain(formData);

      /* 2️⃣ DATABASE (Prisma) */
      await registerBatchDB(formData);

      alert("Batch Registered Successfully");

      loadDashboard();
      setActiveTab("fetch");

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert("Registration Failed");
    }
  };

  /* ================= SHIP ================= */

  const handleShip = async (batchId) => {
    if (!account) return alert("Connect Wallet First");

    try {
      await shipBatch({ batchId });
      loadDashboard();
    } catch (err) {
      console.error("SHIP ERROR:", err);
    }
  };

  const filteredBatches = batches.filter((b) =>
    b.batchId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo-fixed">TRUSTCHAIN</div>

        <div className={`menu ${activeTab==="register"?"active":""}`} onClick={()=>setActiveTab("register")}>REGISTER</div>
        <div className={`menu ${activeTab==="fetch"?"active":""}`} onClick={()=>setActiveTab("fetch")}>FETCH</div>
        <div className={`menu ${activeTab==="ship"?"active":""}`} onClick={()=>setActiveTab("ship")}>SHIP</div>
      </div>

      {/* MAIN */}
      <div className="main">

        <div className="topbar">
          <h1>MANUFACTURER DASHBOARD</h1>

          <button
            className={account ? "wallet connected" : "wallet"}
            onClick={connectWallet}
          >
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "CONNECT METAMASK"}
          </button>
        </div>

        {/* STATS */}
        <div className="stats">
          <StatCard icon="📦" title="TOTAL BATCHES" value={stats.totalBatches} />
          <StatCard icon="🛍️" title="TOTAL PRODUCTS" value={stats.totalProducts} />
          <StatCard icon="🚚" title="SHIPPED" value={stats.totalShipped} />
          <StatCard icon="⛓️" title="TRANSACTIONS" value={stats.totalTransactions} />
        </div>

        {/* REGISTER TAB */}
        {activeTab === "register" && (
          <div className="register-layout">

            <div className="card form-card">
              <h2>REGISTER NEW BATCH</h2>

              <div className="form-grid">

                <div>
                  <FormInput label="BATCH ID" name="batchId" value={formData.batchId} onChange={handleChange}/>
                  <FormInput label="BOX ID" name="boxId" value={formData.boxId} onChange={handleChange}/>
                  <FormInput label="BATCH SIZE" type="number" name="batchSize" value={formData.batchSize} onChange={handleChange}/>
                  <FormInput label="START PRODUCT ID" name="startProductId" value={formData.startProductId} onChange={handleChange}/>
                  <FormInput label="PRODUCT NAME" name="name" value={formData.name} onChange={handleChange}/>
                  <FormInput label="CATEGORY" name="category" value={formData.category} onChange={handleChange}/>
                </div>

                <div>
                  <FormInput label="MANUFACTURER" name="manufacturer" value={formData.manufacturer} onChange={handleChange}/>
                  <FormInput label="MANUFACTURER DATE" type="date" name="manufacturerDate" value={formData.manufacturerDate} onChange={handleChange}/>
                  <FormInput label="MANUFACTURE PLACE" name="manufacturePlace" value={formData.manufacturePlace} onChange={handleChange}/>
                  <FormInput label="MODEL NUMBER" name="modelNumber" value={formData.modelNumber} onChange={handleChange}/>
                  <FormInput label="WARRANTY PERIOD" name="warrantyPeriod" value={formData.warrantyPeriod} onChange={handleChange}/>
                  <FormInput label="COLOR" name="color" value={formData.color} onChange={handleChange}/>
                  <FormInput label="PRICE" type="number" name="price" value={formData.price} onChange={handleChange}/>
                </div>

              </div>

              <button className="primary-btn" onClick={handleRegister}>
                REGISTER ON BLOCKCHAIN
              </button>
            </div>

            {/* ACTIVITY */}
            <div className="card activity-card">
              <h2>RECENT ACTIVITY</h2>

              {activity.map((item, i) => (
                <div key={i} className="activity">
                  <p>{item.message}</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* FETCH */}
        {activeTab === "fetch" && (
          <div className="card">
            <h2>FETCH BATCHES</h2>

            <input
              className="search-bar"
              placeholder="SEARCH BY BATCH ID..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />

            {filteredBatches.map((batch)=>(
              <div key={batch.batchId} className="batch-row">
                <strong>{batch.batchId}</strong>
                <span className={batch.shipped?"badge shipped":"badge pending"}>
                  {batch.shipped?"SHIPPED":"PENDING"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* SHIP */}
        {activeTab === "ship" && (
          <div className="card">
            <h2>SHIP PRODUCTS</h2>

            <input
              className="search-bar"
              placeholder="SEARCH BY BATCH ID..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />

            {filteredBatches
              .filter(b=>!b.shipped)
              .map(batch=>(
                <div key={batch.batchId} className="batch-row">
                  <strong>{batch.batchId}</strong>
                  <button className="ship-btn" onClick={()=>handleShip(batch.batchId)}>
                    SHIP NOW
                  </button>
                </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function FormInput({ label, ...props }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span>{title}</span>
      </div>
      <p className="stat-value">{value || 0}</p>
    </div>
  );
}
