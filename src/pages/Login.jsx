import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

const credentials = {
  retailer: { id: "ret", pass: "123" },
  manufacturer: { id: "man", pass: "123" },
  admin: { id: "admin", pass: "123" }
};

const Login = () => {

  const { role } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // signin/signup
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Load registered users
  const storedUsers =
    JSON.parse(localStorage.getItem("trustchain_users")) || [];

  // ------------------ USER SIGNUP -------------------
  const handleSignUp = () => {

    if (!userId || !email || !password) {
      setError("Fill all fields");
      return;
    }

    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!mailRegex.test(email)) {
      setError("Enter valid email");
      return;
    }

    const exists = storedUsers.find(
      u => u.id === userId || u.email === email
    );

    if (exists) {
      setError("User already exists");
      return;
    }

    storedUsers.push({
      id: userId,
      email,
      pass: password
    });

    localStorage.setItem("trustchain_users", JSON.stringify(storedUsers));

    alert("User registered successfully!");

    setMode("signin");
    setUserId("");
    setEmail("");
    setPassword("");
    setError("");
  };


  // ------------------ LOGIN FOR ALL -------------------
  const handleLogin = () => {

    if (!userId || !password) {
      setError("Enter all login fields");
      return;
    }

    // ---------- USER LOGIN ----------
    if (role === "user") {

      const validUser = storedUsers.find(
        user =>
          (user.id === userId || user.email === userId) &&
          user.pass === password
      );

      if (validUser) {
        navigate(`/dashboard/${role}`);
      } else {
        setError("Invalid user credentials");
      }
      return;
    }

    // ---------- FIXED ROLES ----------
    const fixed = credentials[role];

    if (!fixed) return;

    if (userId === fixed.id && password === fixed.pass) {
      navigate(`/dashboard/${role}`);
    } else {
      setError("Invalid ID or password");
    }
  };


  return (
    <div className="login-page">
      <div className="login-card">

        <h1 className="login-title">
          {role.toUpperCase()} LOGIN
        </h1>

        {/* USER TOGGLE */}
        {role === "user" && (
          <div className="login-toggle">
            <button
              className={mode === "signin" ? "active-toggle" : ""}
              onClick={() => setMode("signin")}
            >
              SIGN IN
            </button>

            <button
              className={mode === "signup" ? "active-toggle" : ""}
              onClick={() => setMode("signup")}
            >
              SIGN UP
            </button>
          </div>
        )}

        {/* USER ID */}
        <input
          className="login-input"
          type="text"
          placeholder={
            role === "user"
              ? "User ID"
              : role === "retailer"
              ? "Retailer ID"
              : role === "manufacturer"
              ? "Manufacturer ID"
              : "Admin ID"
          }
          value={userId}
          onChange={e => setUserId(e.target.value)}
          autoComplete="username"
          name="username"
          required
        />

        {/* EMAIL (USER SIGNUP ONLY) */}
        {role === "user" && mode === "signup" && (
          <input
            className="login-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="off"
            name="email"
            required
          />
        )}

        {/* PASSWORD */}
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          name="password"
          required
        />

        {/* ERROR MESSAGE */}
        {error && (
          <div className="login-error">{error}</div>
        )}

        {/* BUTTON */}
        {role === "user" && mode === "signup" ? (
          <button
            className="btn-primary login-btn"
            onClick={handleSignUp}
          >
            CREATE ACCOUNT
          </button>
        ) : (
          <button
            className="btn-primary login-btn"
            onClick={handleLogin}
          >
            LOGIN
          </button>
        )}

      </div>
    </div>
  );
};

export default Login;
