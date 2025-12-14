// src/components/ManufacturerDashboard.js

import React, { useState } from "react";
import {
  connectBlockchain,
  registerProduct,
  shipProduct,
  getProduct,
  getProductIdsByBox
} from "../../trustChain";
import "../../index2.css";

const defaultProduct = {
  boxId: "BOX123456",
  productId: "P123456",
  name: "Smartphone X",
  category: "Smartphone",
  manufacturer: "TechCorp Ltd.",
  manufacturerDate: "2025-12-10",
  manufacturePlace: "Bangalore, India",
  modelNumber: "X1000",
  serialNumber: "SN123456789",
  warrantyPeriod: "24 months",
  batchNumber: "BATCH-567",
  color: "Black",
  price: 65000,
  image: "/mob.jpg",
  shipped: false,
  verifiedByRetailer: false,
  sold: false
};

const ManufacturerDashboard = () => {
  const [product, setProduct] = useState(defaultProduct);
  const [status, setStatus] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const [boxId, setBoxId] = useState("");
  const [boxProducts, setBoxProducts] = useState([]);
  const [searchProductId, setSearchProductId] = useState("");
  const [fetchedProduct, setFetchedProduct] = useState(null);

  // ---------- Connect Wallet ----------
  const handleConnect = async () => {
    try {
      await connectBlockchain();
      setWalletConnected(true);
      setStatus("");
    } catch (e) {
      setWalletConnected(false);
      setStatus("Connect failed: " + e.message);
    }
  };

  // ---------- Handle Image ----------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProduct(prev => ({ ...prev, image: file.name }));
  };

  // ---------- Check Box Already Shipped ----------
  const isBoxShipped = async (boxIdToCheck) => {
    const productIds = await getProductIdsByBox(boxIdToCheck);
    for (let pid of productIds) {
      const p = await getProduct(pid);
      if (p.shipped) return true;
    }
    return false;
  };

  // ---------- Register Product ----------
  const handleConfirmRegister = async () => {
    try {
      setStatus("Registering...");
      const shipped = await isBoxShipped(product.boxId);
      if (shipped) {
        setStatus("❌ Cannot create product: Box is already shipped");
        return;
      }
      await registerProduct(product);
      setStatus("✅ Product registered successfully!");
    } catch (e) {
      console.error(e);
      setStatus("Registration failed: " + e.message);
    }
  };

  // ---------- Fetch Box Products ----------
  const handleFetchBox = async () => {
    try {
      setStatus("");
      const productIds = await getProductIdsByBox(boxId);
      const fetched = [];
      for (let pid of productIds) {
        const p = await getProduct(pid);
        fetched.push(p);
      }
      setBoxProducts(fetched);
      setStatus(`Box ${boxId} has ${fetched.length} product(s).`);
    } catch (e) {
      console.error(e);
      setBoxProducts([]);
      setStatus("Fetch failed: " + e.message);
    }
  };

  // ---------- Ship All Products in Box ----------
  const handleShipBox = async () => {
    try {
      for (let p of boxProducts) {
        if (!p.shipped) await shipProduct(p.productId);
      }
      handleFetchBox();
    } catch (e) {
      console.error(e);
      setStatus("Ship failed: " + e.message);
    }
  };

  // ---------- Fetch Single Product ----------
  const handleFetchProduct = async () => {
    try {
      setFetchedProduct(await getProduct(searchProductId));
      setStatus("");
    } catch (e) {
      setFetchedProduct(null);
      setStatus("Fetch failed: " + e.message);
    }
  };

  return (
    <div className="premium-dashboard" style={{ width: "100vw", padding: "20px" }}>
      <h2>Manufacturer Dashboard</h2>

      {/* Wallet Connect */}
      <div className="form-row center" style={{ marginBottom: "20px" }}>
        <button
        className={`btn-primary ${walletConnected ? "connected" : ""}`}
        onClick={handleConnect}
        style={{
          backgroundColor: walletConnected ? "#28a745" : "#007bff",
          color: "#fff"
        }}
         >
        {walletConnected ? "Connected" : "Connect Wallet"}
        </button>

      </div>

      {/* Action Buttons */}
      <div className="action-buttons center" style={{ marginBottom: "20px" }}>
        <button
          className={`btn-outline ${activeAction === "register" ? "active" : ""}`}
          onClick={() => setActiveAction("register")}
        >
          Register
        </button>
        <button
          className={`btn-outline ${activeAction === "ship" ? "active" : ""}`}
          onClick={() => setActiveAction("ship")}
        >
          Ship
        </button>
        <button
          className={`btn-outline ${activeAction === "fetch" ? "active" : ""}`}
          onClick={() => setActiveAction("fetch")}
        >
          Fetch
        </button>
      </div>

      {/* ================= REGISTER ================= */}
      {activeAction === "register" && (
        <div className="product-form">
          {/* Product input fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Box ID</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.boxId}
                onChange={e => setProduct({ ...product, boxId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Product ID</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.productId}
                onChange={e => setProduct({ ...product, productId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.name}
                onChange={e => setProduct({ ...product, name: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.category}
                onChange={e => setProduct({ ...product, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.manufacturer}
                onChange={e => setProduct({ ...product, manufacturer: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Manufacturer Date</label>
              <input
                type="date"
                style={{ minWidth: "250px" }}
                value={product.manufacturerDate}
                onChange={e => setProduct({ ...product, manufacturerDate: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Manufacture Place</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.manufacturePlace}
                onChange={e => setProduct({ ...product, manufacturePlace: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Model Number</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.modelNumber}
                onChange={e => setProduct({ ...product, modelNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Serial Number</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.serialNumber}
                onChange={e => setProduct({ ...product, serialNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Warranty Period</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.warrantyPeriod}
                onChange={e => setProduct({ ...product, warrantyPeriod: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Batch Number</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.batchNumber}
                onChange={e => setProduct({ ...product, batchNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                style={{ minWidth: "250px" }}
                value={product.color}
                onChange={e => setProduct({ ...product, color: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                style={{ minWidth: "250px" }}
                value={product.price}
                onChange={e => setProduct({ ...product, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Product Image</label>
              <div className="custom-file-input">
                <input type="file" onChange={handleImageChange} />
                <span className="file-name">{product.image || "mob.jpg"}</span>
              </div>
            </div>
          </div>
          <div className="form-row" style={{ marginTop: "30px" }}>
            <button
              className="btn-primary"
              style={{ backgroundColor: "#28a745", color: "#fff" }}
              onClick={handleConfirmRegister}
            >
              Confirm & Register Product
            </button>
          </div>
          {status && <div className="login-error">{status}</div>}
        </div>
      )}

      {/* ================= SHIP ================= */}
      {activeAction === "ship" && (
        <div className="product-form">
          <div className="form-row" style={{ marginBottom: "10px" }}>
            <input
              className="login-input"
              placeholder="Enter Box ID"
              style={{ width: "400px" }}
              value={boxId}
              onChange={e => setBoxId(e.target.value)}
            />
            <button className="btn-outline" onClick={handleFetchBox}>
              Search Box
            </button>
            {boxProducts.length > 0 && (
              <button
                className="btn-primary"
                style={{ backgroundColor: "#28a745", color: "#fff" }}
                onClick={handleShipBox}
              >
                Ship All ({boxProducts.length})
              </button>
            )}
          </div>

          {boxProducts.length > 0 && (
            <div className="fetched-product-card">
              <h4>Products in Box:</h4>
              <ul>
                {boxProducts.map(p => (
                  <li key={p.productId}>{p.name}</li>
                ))}
              </ul>
            </div>
          )}

          {status && <div className="login-error">{status}</div>}
        </div>
      )}

      {/* ================= FETCH ================= */}
      {activeAction === "fetch" && (
        <div className="product-form">
          <div className="form-row" style={{ marginBottom: "10px" }}>
            <input
              className="login-input"
              placeholder="Enter Product ID"
              style={{ width: "400px" }}
              value={searchProductId}
              onChange={e => setSearchProductId(e.target.value)}
            />
            <button className="btn-outline" onClick={handleFetchProduct}>
              Fetch Product
            </button>
          </div>

          {fetchedProduct && (
            <div className="fetched-product-card premium" style={{ display: "flex", padding: "20px", gap: "20px" }}>
              <div className="fetched-image">
                <img src={fetchedProduct.image} alt={fetchedProduct.name} className="product-preview" />
              </div>
              <div className="fetched-details">
                <h3>{fetchedProduct.name}</h3>
                <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                  <div><strong>Product ID:</strong> {fetchedProduct.productId}</div>
                  <div><strong>Box ID:</strong> {fetchedProduct.boxId}</div>
                  <div><strong>Category:</strong> {fetchedProduct.category}</div>
                  <div><strong>Manufacturer:</strong> {fetchedProduct.manufacturer}</div>
                  <div><strong>Manufacture Date:</strong> {fetchedProduct.manufacturerDate}</div>
                  <div><strong>Manufacture Place:</strong> {fetchedProduct.manufacturePlace}</div>
                  <div><strong>Model Number:</strong> {fetchedProduct.modelNumber}</div>
                  <div><strong>Serial Number:</strong> {fetchedProduct.serialNumber}</div>
                  <div><strong>Batch Number:</strong> {fetchedProduct.batchNumber}</div>
                  <div><strong>Color:</strong> {fetchedProduct.color}</div>
                  <div><strong>Warranty:</strong> {fetchedProduct.warrantyPeriod}</div>
                  <div><strong>Price:</strong> ₹{fetchedProduct.price}</div>
                </div>

                <div className="status-icons" style={{ marginTop: "15px", display: "flex", gap: "20px", fontSize: "18px" }}>
                  <div>
                    <strong>Shipped:</strong> {fetchedProduct.shipped ? <span style={{ color: "green" }}>✔️</span> : <span style={{ color: "red" }}>❌</span>}
                  </div>
                  <div>
                    <strong>Verified:</strong> {fetchedProduct.verifiedByRetailer ? <span style={{ color: "green" }}>✔️</span> : <span style={{ color: "red" }}>❌</span>}
                  </div>
                  <div>
                    <strong>Sold:</strong> {fetchedProduct.sold ? <span style={{ color: "green" }}>✔️</span> : <span style={{ color: "red" }}>❌</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {status && <div className="login-error">{status}</div>}
        </div>
      )}
    </div>
  );
};

export default ManufacturerDashboard;
