import pool from "../config/db.js";

/*
NOTE: This model assumes you have the following tables in your database:
1. stocks: (id, user_id, name, price, quantity, created_at)
2. gold_holdings: (id, user_id, quantity_in_grams, purchase_price_per_gram, purchase_date)
3. cash_holdings: (id, user_id, amount, monthly_interest, start_date, type, bank)
*/

// --- Stock Model Functions ---

const addstockmodel = async (userId, stockData) => {
  const { stockName, stockPrice, stockQuantity } = stockData;
  const [result] = await pool.query(
    "INSERT INTO stocks (user_id, name, price, quantity) VALUES (?, ?, ?, ?)",
    [userId, stockName, stockPrice, stockQuantity]
  );
  return {
    success: true,
    message: "Stock added successfully",
    stockId: result.insertId,
  };
};

const getstocksmodel = async (userId) => {
  const [rows] = await pool.query(
    "SELECT id, name AS stockName, price AS stockPrice, quantity AS stockQuantity FROM stocks WHERE user_id = ?",
    [userId]
  );
  return rows;
};

const removestockmodel = async (userId, stockId) => {
  const [result] = await pool.query(
    "DELETE FROM stocks WHERE user_id = ? AND id = ?",
    [userId, stockId]
  );
  if (result.affectedRows === 0) {
    throw new Error("Stock not found or not owned by user");
  }
  return { success: true, message: "Stock removed successfully" };
};

// --- Gold Model Functions 🪙 ---

const addgoldmodel = async (userId, goldData) => {
  const { quantityInGrams, purchasePricePerGram, purchaseDate } = goldData;
  const [result] = await pool.query(
    "INSERT INTO gold_holdings (user_id, quantity_in_grams, purchase_price_per_gram, purchase_date) VALUES (?, ?, ?, ?)",
    [userId, quantityInGrams, purchasePricePerGram, purchaseDate]
  );
  return {
    success: true,
    message: "Gold added successfully",
    goldId: result.insertId,
  };
};

const getgoldmodel = async (userId) => {
  const [rows] = await pool.query(
     "SELECT id, quantity_in_grams AS quantityInGrams, purchase_price_per_gram AS purchasePricePerGram, purchase_date FROM gold_holdings WHERE user_id = ?",
    [userId]
  );
  return rows;
};

const removegoldmodel = async (userId, goldId) => {
  const [result] = await pool.query(
    "DELETE FROM gold_holdings WHERE user_id = ? AND id = ?",
    [userId, goldId]
  );
  if (result.affectedRows === 0) {
    throw new Error("Gold holding not found or not owned by user");
  }
  return { success: true, message: "Gold removed successfully" };
};

// --- Cash Model Functions 💵 ---

const addcashmodel = async (userId, cashData) => {
  const { amount, type, interest, bank, date } = cashData;
  const [result] = await pool.query(
    "INSERT INTO cash_holdings (user_id, amount, monthly_interest, start_date, type, bank) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, amount, interest, date, type, bank]
  );
  return {
    success: true,
    message: "Cash added successfully",
    cashId: result.insertId,
  };
};

const getcashmodel = async (userId) => {
  const [rows] = await pool.query(
    "SELECT id, amount, monthly_interest AS interest, start_date AS date, type, bank FROM cash_holdings WHERE user_id = ?",
    [userId]
  );
  return rows;
};

const removecashmodel = async (userId, cashId) => {
  const [result] = await pool.query(
    "DELETE FROM cash_holdings WHERE user_id = ? AND id = ?",
    [userId, cashId]
  );
  if (result.affectedRows === 0) {
    throw new Error("Cash holding not found or not owned by user");
  }
  return { success: true, message: "Cash removed successfully" };
};

const addbondmodel = async (userId, bondData) => {
  const { bondName, issueDate, maturityDate, principalAmount, couponRate } = bondData;
  const [result] = await pool.query(
      "INSERT INTO bonds (user_id, bond_name, issue_date, maturity_date, principal_amount, coupon_rate) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, bondName, issueDate, maturityDate, principalAmount, couponRate]
  );
  return {
      success: true,
      message: "Bond added successfully",
      bondId: result.insertId,
  };
};

const getbondsmodel = async (userId) => {
  const [rows] = await pool.query(
      "SELECT id, bond_name as bondName, issue_date as issueDate, maturity_date as maturityDate, principal_amount as principalAmount, coupon_rate as couponRate FROM bonds WHERE user_id = ?",
      [userId]
  );
  return rows;
};

const removebondmodel = async (userId, bondId) => {
  const [result] = await pool.query("DELETE FROM bonds WHERE user_id = ? AND id = ?", [userId, bondId]);
  if (result.affectedRows === 0) {
      throw new Error("Bond not found or not owned by user");
  }
  return { success: true, message: "Bond removed successfully" };
};

export {
  addstockmodel,
  getstocksmodel,
  removestockmodel,
  addgoldmodel,
  getgoldmodel,
  removegoldmodel,
  addcashmodel,
  getcashmodel,
  removecashmodel,
  addbondmodel,     // <-- Export new function
  getbondsmodel,    // <-- Export new function
  removebondmodel,  // <-- Export new function
};