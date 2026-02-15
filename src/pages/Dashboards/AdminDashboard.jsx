// src/components/AdminDashboard.js

import React, { useState } from "react";
import {
  connectBlockchain,
  getProduct,
  getProductIdsByBox,
  shipBox,
  verifyRetailer,
  saleComplete
} from "../../trustChain";

import "../../index2.css";

const AdminDashboard = () => {
  const [boxId, setBoxId] = useState("");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= CONNECT WALLET ================= */

  const handleConnect = async () => {
    try {
      await connectBlockchain();
      setWalletConnected(true);
      setStatus("✅ Wallet Connected");
    } catch (e) {
      setWalletConnected(false);
      setStatus("❌ Wallet connection failed: " + e.message);
    }
  };

  /* ================= FETCH BOX PRODUCTS ================= */

  const fetchBoxProducts = async () => {
    try {
      if (!boxId) {
        setStatus("⚠️ Please enter a Box ID");
        return;
      }

      setLoading(true);
      setStatus("⏳ Fetching products...");
      setProducts([]);

      const ids = await getProductIdsByBox(boxId);

      const fetched = [];

      for (const id of ids) {
        const p = await getProduct(id);
        fetched.push(p);
      }

      setProducts(fetched);
      setStatus(`✅ Box ${boxId} contains ${fetched.length} products`);
    } catch (e) {
      setStatus("❌ Fetch failed: " + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  /* ================= SHIP BOX ================= */

  const handleShipBox = async () => {
    try {
      if (!boxId) {
        setStatus("⚠️ Enter Box ID first");
        return;
      }

      setLoading(true);
      setStatus("⏳ Shipping box...");

      await shipBox(boxId);

      setStatus(`✅ Box ${boxId} marked as shipped`);
      await fetchBoxProducts();
    } catch (e) {
      if (e.code === 4001) {
        setStatus("⚠️ Transaction cancelled by user");
      } else {
        setStatus("❌ Ship failed: " + (e.reason || e.message));
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY PRODUCT ================= */

  const handleVerify = async (productId) => {
    try {
      setLoading(true);
      setStatus("⏳ Verifying product...");

      await verifyRetailer(productId);

      setStatus(`✅ Product ${productId} verified`);
      await fetchBoxProducts();
    } catch (e) {
      if (e.code === 4001) {
        setStatus("⚠️ Transaction cancelled by user");
      } else {
        setStatus("❌ Verify failed: " + (e.reason || e.message));
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= MARK SOLD ================= */

  const handleMarkSold = async (productId) => {
    try {
      setLoading(true);
      setStatus("⏳ Marking product as sold...");

      await saleComplete(productId);

      setStatus(`✅ Product ${productId} marked as sold`);
      await fetchBoxProducts();
    } catch (e) {
      if (e.code === 4001) {
        setStatus("⚠️ Transaction cancelled by user");
      } else {
        setStatus("❌ Mark sold failed: " + (e.reason || e.message));
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="premium-dashboard" style={{ width: "100vw", padding: 20 }}>
      <h2>Admin Dashboard</h2>

      {/* CONNECT WALLET */}
      <div style={{ marginBottom: 20 }}>
        <button
          className="btn-primary"
          onClick={handleConnect}
          style={{
            backgroundColor: walletConnected ? "#28a745" : "#007bff"
          }}
        >
          {walletConnected ? "Connected" : "Connect Wallet"}
        </button>
      </div>

      {/* BOX INPUT */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter Box ID"
          value={boxId}
          onChange={(e) => setBoxId(e.target.value)}
          className="login-input"
        />
        <button className="btn-outline" onClick={fetchBoxProducts}>
          Fetch Products
        </button>

        <button
          className="btn-primary"
          style={{ marginLeft: 10 }}
          onClick={handleShipBox}
        >
          Ship Box
        </button>
      </div>

      {/* PRODUCTS TABLE */}
      {products.length > 0 && (
        <div className="fetched-product-card">
          <h4>Products in Box {boxId}</h4>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Shipped</th>
                <th>Verified</th>
                <th>Sold</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.productId}>
                  <td>{p.productId}</td>
                  <td>{p.name}</td>
                  <td>{p.shipped ? "✔" : "❌"}</td>
                  <td>{p.verifiedByRetailer ? "✔" : "❌"}</td>
                  <td>{p.sold ? "✔" : "❌"}</td>

                  <td>
                    {/* VERIFY */}
                    {p.shipped && !p.verifiedByRetailer && (
                      <button
                        disabled={loading}
                        onClick={() => handleVerify(p.productId)}
                      >
                        Verify
                      </button>
                    )}

                    {/* MARK SOLD */}
                    {p.verifiedByRetailer && !p.sold && (
                      <button
                        disabled={loading}
                        onClick={() => handleMarkSold(p.productId)}
                      >
                        Mark Sold
                      </button>
                    )}

                    {/* COMPLETED */}
                    {p.sold && <span style={{ color: "green" }}>Completed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STATUS */}
      {status && (
        <div className="login-error" style={{ marginTop: 20 }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;