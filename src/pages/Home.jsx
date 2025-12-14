import React, { useEffect, useState } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";

const Home = () => {

  // -------------------------------
  // NAVIGATION
  // -------------------------------
  const navigate = useNavigate();

  // -------------------------------
  // STATES
  // -------------------------------
  const [activeSection, setActiveSection] = useState("home");
  const [showMore, setShowMore] = useState(false);

  // -------------------------------
  // NAVBAR SCROLL SPY
  // -------------------------------
  useEffect(() => {
    const sections = ["home", "about", "features", "contact"];

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (let section of sections) {
        const elem = document.getElementById(section);
        if (!elem) continue;

        const top = elem.offsetTop;
        const bottom = top + elem.offsetHeight;

        if (scrollPos >= top && scrollPos < bottom) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -------------------------------
  // SMOOTH SCROLL
  // -------------------------------
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // -------------------------------
  // ABOUT TEXT (NORMAL TEXT)
  // -------------------------------
  const aboutText =
    "TrustChain ensures product security using blockchain-powered verification. Our platform guarantees authenticity, prevents duplication, and enables traceability from manufacturer to end user.";

  // -------------------------------
  // FEATURE CARD SCROLL ANIMATION
  // -------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting)
            entry.target.classList.add("show");
          else
            entry.target.classList.remove("show");
        });
      },
      { threshold: 0.25 }
    );

    document.querySelectorAll(".feature-card")
      .forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  // ==================================================
  // JSX
  // ==================================================
  return (
    <div>

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/bc1.png" alt="Logo" className="nav-logo-img" />
          <span className="nav-brand">TRUSTCHAIN</span>
        </div>

        <ul className="nav-links">
          {["home", "about", "features", "contact"].map(link => (
            <li key={link}>
              <a
                className={activeSection === link ? "active-link" : ""}
                onClick={() => scrollTo(link)}
              >
                {link.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ================= HOME ================= */}
      <section id="home" className="container home-section">

        <img src="/bc1.png" alt="Blockchain Logo" className="logo" />

        <div className="heading-section">
          <h1>
            <span className="line1">BLOCKCHAIN BASED</span><br />
            <span className="line2">PRODUCT SECURITY</span>
          </h1>

          <p className="motto">
            Securing your products with trust, transparency, and innovation.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate("/roles")}
            >
              Get Started
            </button>

            <button
              className="btn-outline"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Show Less" : "See More"}
            </button>
          </div>

          {showMore && (
            <div className="extra-paragraph">
              <p>
                TrustChain is a blockchain-powered product authentication platform
                that verifies every product through encrypted QR codes and
                tamper-proof blockchain records.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="about-section">
        <div className="about-box">

          <div className="about-content">
            <h2>ABOUT OUR SYSTEM</h2>
            <p className="about-text">{aboutText}</p>
          </div>

          <img
            src="/blockchain.png"
            alt="Blockchain"
            className="about-img"
          />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="section features-section">

        <h2 className="fade-heading">
          {"FEATURES".split("").map((letter, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              {letter}
            </span>
          ))}
        </h2>

        <div className="features">

          <div className="feature-card slide-left">
            <img src="folder.png" className="feature-icon" alt="lock" />
            <h3>Immutable Records</h3>
            <p>All transactions are permanently recorded and cannot be altered.</p>
          </div>

          <div className="feature-card slide-right">
            <img src="qr-code.png" className="feature-icon" alt="verify" />
            <h3>Trusted Verification</h3>
            <p>Consumers instantly validate authenticity using QR scanning.</p>
          </div>

          <div className="feature-card slide-left">
            <img src="track.png" className="feature-icon" alt="tracking" />
            <h3>Transparent Supply Chain</h3>
            <p>Track products clearly from manufacturing to delivery.</p>
          </div>

          <div className="feature-card slide-right">
            <img src="fake.png" className="feature-icon" alt="security" />
            <h3>Anti-Counterfeit Protection</h3>
            <p>Eliminates fraudulent products using blockchain matching.</p>
          </div>

        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="contact-section">
        <div className="contact-box">

          <h2 className="contact-title">GET IN TOUCH</h2>
          <p className="contact-subtitle">
            Have questions about TrustChain or want to integrate blockchain
            authentication into your product line? We’re here to help.
          </p>

          <div className="contact-grid">

            {/* LEFT INFO */}
            <div className="contact-info">

              <div className="info-item">
                <span className="info-label">Email</span>
                <p>support@trustchain.com</p>
              </div>

              <div className="info-item">
                <span className="info-label">Phone</span>
                <p>+91 9876543210</p>
              </div>

              <div className="info-item">
                <span className="info-label">Office</span>
                <p>123 Blockchain Street<br />Tech City, India</p>
              </div>

            </div>

          </div>

          {/* SOCIAL ICONS */}
          <div className="contact-socials">
            <a href="#" className="social-link">
              <img src="/instagram.png" alt="Instagram" />
            </a>

            <a href="#" className="social-link">
              <img src="/linkedin.png" alt="LinkedIn" />
            </a>

            <a href="#" className="social-link">
              <img src="/social.png" alt="Social" />
            </a>
          </div>

        </div>
      </section>



      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>© 2025 TrustChain. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Home;
