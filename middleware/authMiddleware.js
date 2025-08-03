// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { findUserById } from '../models/User.js'; // Import the function for MySQL

/**
 * Middleware to protect routes by verifying a user's JWT token.
 * It checks for a token in cookies, verifies it, and attaches the user's data
 * to the request object if the token is valid and the user exists.
 */
export const auth = async (req, res, next) => {
 
  const token = req.cookies.token;

  // 2. Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // 4. Get user from the database using the ID from the token
    // This ensures the user still exists.
    req.user = await findUserById(decoded.user.id);

    // 5. Handle case where user associated with token no longer exists
    if (!req.user) {
      res.clearCookie('token'); // Clear the invalid cookie
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // 6. Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Token verification error in middleware:', err.message);
    res.clearCookie('token'); // Clear the invalid cookie
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};
