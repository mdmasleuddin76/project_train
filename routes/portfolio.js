// routes/portfolio.js
import express from 'express';
import {
  addstock,
  getstocks,
  removestock,
  addgold,
  getgold,
  removegold,
  addcash,
  getcash,
  removecash,
  addbond,
  getbonds,
  removebond
  ,getDashboard
} from '../controllers/portfolioController.js';
import {auth} from '../middleware/authMiddleware.js'; // Middleware to protect routes

const router = express.Router();

// --- Stock Routes ---

// @route   POST api/portfolio/addstock
// @desc    Add a stock to the user's portfolio
// @access  Private
router.post('/addstock', auth, addstock);

// @route   GET api/portfolio/getstocks
// @desc    Get all stocks for the logged-in user
// @access  Private
router.get('/getstocks', auth, getstocks);

// @route   POST api/portfolio/removestock
// @desc    Remove a specific stock from the portfolio
// @access  Private
router.post('/removestock', auth, removestock);


router.post('/addbond', auth, addbond);

// @route   GET api/portfolio/getbonds
// @desc    Get all bonds for the logged-in user
// @access  Private
router.get('/getbonds', auth, getbonds);

// @route   POST api/portfolio/removebond
// @desc    Remove a specific bond from the portfolio
// @access  Private
router.post('/removebond', auth, removebond);


// --- Gold Routes ---

// @route   POST api/portfolio/addgold
// @desc    Add a gold holding to the portfolio
// @access  Private
router.post('/addgold', auth, addgold);

// @route   GET api/portfolio/getgold
// @desc    Get all gold holdings for the logged-in user
// @access  Private
router.get('/getgold', auth, getgold);

// @route   POST api/portfolio/removegold
// @desc    Remove a specific gold holding from the portfolio
// @access  Private
router.post('/removegold', auth, removegold);


// --- Cash Routes ---

// @route   POST api/portfolio/addcash
// @desc    Add a cash holding to the portfolio
// @access  Private
router.post('/addcash', auth, addcash);

// @route   GET api/portfolio/getcash
// @desc    Get all cash holdings for the logged-in user
// @access  Private
router.get('/getcash', auth, getcash);

// @route   POST api/portfolio/removecash
// @desc    Remove a specific cash holding from the portfolio
// @access  Private
router.post('/removecash', auth, removecash);
router.get('/summary', auth, getDashboard);


export default router;
