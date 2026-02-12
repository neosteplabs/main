/* ============================= */
/* GLOBAL RESET */
/* ============================= */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: #f4f6f9;
  color: #1a1a1a;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* ============================= */
/* NAVBAR */
/* ============================= */

.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e8ecf2;
  padding: 18px 0;
}

.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.55rem;
  font-weight: 700;
  text-decoration: none;
  color: #1a1a1a;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 28px;
}

.nav-links a {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #1a1a1a;
}

/* ============================= */
/* CONTENT WRAPPER */
/* ============================= */

#content {
  max-width: 1100px;
  margin: 80px auto;
  padding: 0 24px;
  animation: fadeIn 0.4s ease-in-out;
}

/* ============================= */
/* HERO */
/* ============================= */

.hero {
  text-align: center;
  padding: 80px 0 40px;
}

.hero h1 {
  font-size: 2.6rem;
  font-weight: 700;
  margin-bottom: 18px;
}

.hero p {
  font-size: 1.1rem;
  color: #5a6473;
  max-width: 600px;
  margin: 0 auto 30px;
}

/* ============================= */
/* BUTTONS */
/* ============================= */

.btn {
  display: inline-block;
  padding: 14px 32px;
  background: #1a1a1a;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #000;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

/* ============================= */
/* SECURE GATE */
/* ============================= */

.secure-gate {
  max-width: 480px;
  margin: 0 auto;
  padding: 50px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.secure-gate input {
  width: 100%;
  padding: 14px;
  margin: 18px 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.secure-gate button {
  width: 100%;
  padding: 14px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.error-message {
  color: #e53e3e;
  margin-top: 10px;
  font-size: 0.9rem;
}

/* ============================= */
/* CATALOG */
/* ============================= */

.catalog-page {
  text-align: center;
}

.catalog-page h1 {
  font-size: 2rem;
  margin-bottom: 30px;
}

.access-banner {
  background: #edfdf4;
  color: #047857;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 35px;
  font-weight: 600;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
  margin-top: 30px;
}

.product-card {
  background: #ffffff;
  padding: 32px;
  border-radius: 14px;
  border: 1px solid #edf2f7;
  transition: all 0.25s ease;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(0,0,0,0.06);
}

/* ============================= */
/* FOOTER (PROPERLY CENTERED) */
/* ============================= */

footer {
  background: #111;
  color: #ffffff;
  padding: 50px 0;
  margin-top: 100px;
}

.footer-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.footer-container p {
  font-size: 0.9rem;
  opacity: 0.85;
}

/* ============================= */
/* ANIMATION */
/* ============================= */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
