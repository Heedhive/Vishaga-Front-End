import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Login } from "./page/auth/login";
import { Signup } from "./page/auth/signup";
import { Home } from "./page/home/home";
import Navbar from "./components/navbar";
import { Products } from "./page/products/product";
import { Gallery } from "./page/gallery/index.jsx";
import { Contact } from "./page/contact/contact";
import { AdminDashBoard } from "./page/admin/dashboard";
import EditProduct from "./page/admin/edit.product";
import CreateProduct from "./page/admin/create.product";
import { ProductDetails } from "./page/products/product.details";
import { Profile } from "./page/profile";
import { About } from "./page/about/index.jsx";
import { AdminLogin } from "./page/admin/admin.login"; // Import AdminLogin
import { DOMAIN_URL } from "./constant/index.js";
import Footer from "./components/footer/index.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // New state for admin login
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      // Check user login status
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const response = await fetch(`${DOMAIN_URL}check_login`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Error checking user login status:", error);
      }

      // Check admin login status from localStorage
      if (localStorage.getItem("is_admin") === "true") {
        setIsAdminLoggedIn(true);
      }

      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Router>
        <Navbar
          setIsLoggedIn={setIsLoggedIn}
          isAdminLoggedIn={isAdminLoggedIn}
          isLoggedIn={isLoggedIn}
          setIsAdminLoggedIn={setIsAdminLoggedIn}
        />
        <Routes>
          {/* User Authentication Routes */}
          <Route
            path="/signup"
            element={
              !isLoggedIn ? (
                <Signup
                  setIsLoggedIn={setIsLoggedIn}
                  setIsAdminLoggedIn={setIsAdminLoggedIn}
                />
              ) : (
                <Navigate to="/home" />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isLoggedIn ? (
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                  setIsAdminLoggedIn={setIsAdminLoggedIn}
                />
              ) : (
                <Navigate to="/home" />
              )
            }
          />
          <Route
            path="/profile"
            element={<Profile setIsLoggedIn={setIsLoggedIn} />}
          />

          {/* Admin Authentication Route */}
          <Route
            path="/admin/login"
            element={
              !isAdminLoggedIn ? (
                <AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} />
              ) : (
                <Navigate to="/admin/dashboard" />
              )
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              isAdminLoggedIn ? (
                <AdminDashBoard />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/product/:id/edit"
            element={
              isAdminLoggedIn ? <EditProduct /> : <Navigate to="/admin/login" />
            }
          />
          <Route
            path="/admin/create/product"
            element={
              isAdminLoggedIn ? (
                <CreateProduct />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Default Route */}
          {/* <Route
            path="*"
            element={
              isLoggedIn
                ? <Navigate to="/home" />
                : isAdminLoggedIn
                ? <Navigate to="/admin/dashboard" />
                : <Navigate to="/login" />
            }
          /> */}
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
