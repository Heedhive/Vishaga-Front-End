import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./navbar.css";
import { DOMAIN_URL } from "../../constant";
import logo from "../../page/assest/logo.png";

export default function Navbar({
  setIsLoggedIn,
  isLoggedIn,
  isAdminLoggedIn,
  setIsAdminLoggedIn
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${DOMAIN_URL}logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      localStorage.removeItem("auth_token");
      setIsLoggedIn(false);
      navigate("/login");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("is_admin");
    setIsAdminLoggedIn(false);
    navigate("/admin/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <img
            src={logo}
            alt="Logo"
            className="logo-image"
            width="80"
            height="80"
          />
          <span>Vishaga Foods</span>
        </div>

        {/* Hamburger Icon */}
        <div
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        {/* Navigation Links */}
        <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <li>
            <Link
              to="/home"
              className={location.pathname === "/home" ? "active-nav-link" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={location.pathname === "/products" ? "active-nav-link" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/gallery"
              className={location.pathname === "/gallery" ? "active-nav-link" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Gallery
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={location.pathname === "/contact" ? "active-nav-link" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              className={location.pathname === "/cart" ? "active-nav-link" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Cart
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={location.pathname === "/profile" ? "active-nav-link" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          </li>
          {isAdminLoggedIn ? (
            <>
              <li>
                <Link
                  to="/admin/dashboard"
                  className={
                    location.pathname.startsWith("/admin")
                      ? "active-nav-link"
                      : ""
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              </li>
              <li>
                <button onClick={handleAdminLogout}>Admin Logout</button>
              </li>
            </>
          ) : isLoggedIn ? (
            <li>
              <button onClick={handleLogout} style={{
                color: 'white',
              }}>Logout</button>
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className={location.pathname === "/login" ? "active-nav-link" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
