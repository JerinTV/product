// src/components/UserDashboard.js

import React, { useState } from "react";
import { getProduct } from "../../trustChain";
import "../../index2.css";

const UserDashboard = () => {
  const [searchProductId, setSearchProductId] = useState("");
  const [status, setStatus] = useState("");
  const [fetchedProduct, setFetchedProduct] = useState(null);

  // ---------- Fetch Single Product ----------
  const handleFetchProduct = async () => {
    try {
      const p = await getProduct(searchProductId);

      if (!p || !p.productId) {
        setFetchedProduct(null);
        setStatus("❌ Product not found");
        return;
      }

      setFetchedProduct(p);
      setStatus("");
    } catch (e) {
      setFetchedProduct(null);
      setStatus("Fetch failed: " + e.message);
    }
  };

  return (
    <div className="premium-dashboard" style={{ width: "100vw", padding: "20px" }}>
      <h2>Product Verification Portal</h2>

      {/* ================= FETCH PRODUCT ================= */}
      <div className="product-form">
        <div className="form-row" style={{ marginBottom: "15px" }}>
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

        {status && <div className="login-error">{status}</div>}

        {/* ================= FETCHED PRODUCT CARD ================= */}
        {fetchedProduct && (
          <div
            className="fetched-product-card premium"
            style={{
              display: "flex",
              padding: "25px",
              gap: "25px",
              width: "95%",
              marginTop: "20px",
              alignItems: "flex-start"
            }}
          >
            {/* ---------- LARGE PRODUCT IMAGE ---------- */}
            <div className="fetched-image">
              <img
                src={fetchedProduct.image}
                alt={fetchedProduct.name}
                className="product-preview"
                style={{
                  width: "350px",
                  height: "350px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.25)"
                }}
              />
            </div>

            {/* ---------- DETAILS ---------- */}
            <div className="fetched-details" style={{ flex: 1 }}>
              <h3>{fetchedProduct.name}</h3>

              <div
                className="details-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                  marginTop: "10px"
                }}
              >
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

              {/* ---------- STATUS ICONS ---------- */}
              <div
                className="status-icons"
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "30px",
                  fontSize: "20px"
                }}
              >
                <div>
                  <strong>Shipped:</strong>{" "}
                  {fetchedProduct.shipped ? (
                    <span style={{ color: "green" }}>✔️</span>
                  ) : (
                    <span style={{ color: "red" }}>❌</span>
                  )}
                </div>

                <div>
                  <strong>Verified:</strong>{" "}
                  {fetchedProduct.verifiedByRetailer ? (
                    <span style={{ color: "green" }}>✔️</span>
                  ) : (
                    <span style={{ color: "red" }}>❌</span>
                  )}
                </div>

                <div>
                  <strong>Sold:</strong>{" "}
                  {fetchedProduct.sold ? (
                    <span style={{ color: "green" }}>✔️</span>
                  ) : (
                    <span style={{ color: "red" }}>❌</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
