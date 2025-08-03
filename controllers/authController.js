// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser, findUserById } from "../models/User.js";
import config from "../config/config.js";

// Helper function to set the JWT cookie (no changes needed here)
const sendTokenResponse = (user, statusCode, res) => {
  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
  const options = {
     httpOnly: true,
     secure: false, // Must be false for HTTP (localhost)
     sameSite: 'lax', // Good default for development
     expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
     path: '/', // Make cookie available on all routes
     };
  const userData = { id: user.id, name: user.name, email: user.email };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, user: userData });
};

// Signup Function - Rewritten for SQL
export const signup = async (req, res) => {
  const { name, email, phone, confirmPassword } = req.body;
  const password = confirmPassword;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create user in the database
    const newUserId = await createUser({ name, email, phone, password });

    // Fetch the newly created user (without password) to send in response
    const newUser = await findUserById(newUserId);

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login Function - Rewritten for SQL
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    // Compare the provided password with the hashed password from the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Token Function - Rewritten for SQL
export const verifyToken = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await findUserById(decoded.user.id);

    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.clearCookie("token");
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// Logout Function (no database interaction, no changes needed)
export const logout = (req, res) => {
  res.cookie("token", "none", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    expires: new Date(Date.now()),
  });
  res.status(200).json({ success: true, message: "User logged out" });
};
