// models/userModel.js
import pool from "../config/db.js"; // Your MySQL connection pool
import bcrypt from "bcryptjs";

/**
 * Finds a user in the database by their email address.
 * @param {string} email - The user's email.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
};

/**
 * Finds a user in the database by their ID.
 * @param {number} id - The user's ID.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
export const findUserById = async (id) => {
  const [rows] = await pool.query("SELECT id, name, email, phone FROM users WHERE id = ?", [id]);
  return rows[0] || null;
};

/**
 * Creates a new user in the database.
 * @param {object} userData - Object containing name, email, phone, and password.
 * @returns {Promise<number>} The ID of the newly created user.
 */
export const createUser = async (userData) => {
  const { name, email, phone, password } = userData;

  // Hash the password before storing it
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await pool.query(
    "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
    [name, email, phone, hashedPassword]
  );

  return result.insertId; // Return the ID of the new user
};
