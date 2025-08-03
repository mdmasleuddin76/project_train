// routes/auth.js
import express from 'express';
import { signup, login, verifyToken, logout} from '../controllers/authController.js'; // Import new functions

const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register user & set cookie
// @access  Public
router.post('/signup', signup);

// @route   POST api/auth/login
// @desc    Authenticate user, set cookie & get user data
// @access  Public
router.post('/login', login);

// @route   GET api/auth/verify
// @desc    Verify user token from cookie and get user data
// @access  Private (implicitly, checks for cookie)
router.get('/verify', verifyToken);

// @route   POST api/auth/logout
// @desc    Log user out and clear cookie
// @access  Public (or Private depending on if you need to be logged in to log out)
router.post('/logout', logout);
export default router;