import React, { useState } from "react";
//import Header from "./Components/Header.tsx";
//import LandingNav from "./Components/LandingPageNavigation.tsx";
import Footer from "./Components/Footer.tsx";
import "bootstrap/dist/css/bootstrap.css";
import "/src/Login.css";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { auth, googleProvider, firestore } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("User Data:", userDoc.data());
        return userDoc.data();
      } else {
        setError("User data not found in Firestore.");
        return null;
      }
    } catch (error) {
      setError("Error fetching user data.");
      return null;
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userData = await fetchUserData(user.uid);
      if (userData) {
        alert(`Login Successful! Welcome, ${userData.name || "User"}!`);
        window.location.href = "dashboard.html"; // Redirect to the dashboard
      }
    } catch (error) {
      setError("User not found or incorrect credentials.");
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Fetch user data from Firestore
      const userData = await fetchUserData(user.uid);
      if (userData) {
        alert(
          `Google Sign-in Successful! Welcome, ${userData.name || "User"}!`
        );
        window.location.href = "dashboard.html";
      }
    } catch (error) {
      setError("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <React.Fragment>
      <motion.div
        className="d-flex justify-content-center"
        id="bg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="col-md-auto card mt-5 mb-5 p-5"
          id="card-bg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2
            id="color-text1"
            className="text-center"
            style={{ fontWeight: 900 }}
          >
            Login
          </h2>
          <motion.span
            id="color-text2"
            className="text-center pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Welcome Back! Please Log in to access your account.
          </motion.span>

          {error && <motion.p className="text-danger">{error}</motion.p>}

          <span className="pt-2 pb-2" style={{ fontWeight: 500 }}>
            Email
          </span>
          <motion.input
            className="rounded p-2 border-0"
            name="Email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />

          <span className="pt-2 pb-2" style={{ fontWeight: 500 }}>
            Password
          </span>
          <motion.div
            className="d-flex align-items-center position-relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <input
              className="rounded p-2 border-0 w-100"
              name="Password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <motion.button
              type="button"
              className="position-absolute end-0 me-2 bg-transparent border-0"
              onClick={() => setPasswordVisible(!passwordVisible)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {passwordVisible ? <EyeOff /> : <Eye />}
            </motion.button>
          </motion.div>

          <a className="text-end p-0">Forget Password?</a>
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <input type="checkbox" /> Remember me
          </motion.label>

          <motion.button
            id="login-btn"
            className="rounded p-2 mt-2 border-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={handleLogin}
          >
            Log In
          </motion.button>

          <div className="line-container mt-3 mb-3" id="-or-line">
            <motion.div
              className="line"
              id="-line-"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6 }}
            ></motion.div>
            <span className="text" id="-or-">
              OR
            </span>
            <motion.div
              className="line"
              id="-line-"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6 }}
            ></motion.div>
          </div>

          <motion.button
            className="rounded p-2 border-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={handleGoogleSignIn}
          >
            Google
          </motion.button>
        </motion.div>
      </motion.div>
      <Footer />
    </React.Fragment>
  );
}

export default Login;
