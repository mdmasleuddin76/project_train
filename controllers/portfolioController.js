import {
  addstockmodel,
  getstocksmodel,
  removestockmodel,
  addgoldmodel,
  getgoldmodel,
  removegoldmodel,
  addcashmodel,
  getcashmodel,
  removecashmodel,
  addbondmodel, getbondsmodel, removebondmodel,
} from "../models/portfolioModel.js";
import axios from "axios";

// --- Helper Function ---

function calculateBondInterest(principal, annualRatePercent, issueDateString) {
  const issueDate = new Date(issueDateString);
  const currentDate = new Date();
  
  // Calculate the difference in time in milliseconds
  const timeDiff = currentDate.getTime() - issueDate.getTime();
  
  // Convert time difference from milliseconds to years
  const yearsDiff = timeDiff / (1000 * 3600 * 24 * 365.25);
  
  if (yearsDiff <= 0) {
      return 0;
  }
  
  const annualRateDecimal = annualRatePercent / 100;
  const interestAmount = principal * annualRateDecimal * yearsDiff;
  
  return parseFloat(interestAmount.toFixed(2));
}

function calculateMonthlyInterest(principal, monthlyRatePercent, startDateString) {
  const startDate = new Date(startDateString);
  const currentDate = new Date();

  let years = currentDate.getFullYear() - startDate.getFullYear();
  let months = currentDate.getMonth() - startDate.getMonth();
  let totalMonths = years * 12 + months;

  if (currentDate.getDate() < startDate.getDate()) {
    totalMonths--;
  }

  totalMonths = Math.max(0, totalMonths);
  const monthlyRateDecimal = monthlyRatePercent / 100;
  const interestAmount = principal * monthlyRateDecimal * totalMonths;

  return parseFloat(interestAmount.toFixed(2));
}

// --- Stock Functions ---

export const addstock = async (req, res) => {
  const { stockName, stockPrice, stockQuantity } = req.body;
  if (!stockName || !stockPrice || !stockQuantity) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  try {
    const userId = req.user.id;
    const result = await addstockmodel(userId, { stockName, stockPrice, stockQuantity });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removestock = async (req, res) => {
  const { stockId } = req.body;
  if (!stockId) {
    return res.status(400).json({ success: false, message: "Stock ID is required" });
  }
  try {
    const userId = req.user.id;
    const result = await removestockmodel(userId, stockId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error removing stock:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getstocks = async (req, res) => {
  try {
    const userId = req.user.id;
    const stocks = await getstocksmodel(userId);
    const enrichedStocks = await Promise.all(
      stocks.map(async (stock) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.stockName}?interval=1m&range=1d`;
          const response = await axios.get(url);
          const currentPrice = response.data.chart.result?.[0]?.meta?.regularMarketPrice;

          if (currentPrice == null) throw new Error("Price not available from API");

          const gain = (currentPrice - stock.stockPrice) * stock.stockQuantity;
          const gainPercent = ((currentPrice - stock.stockPrice) / stock.stockPrice) * 100;

          return {
            ...stock,
            currentPrice,
            gain: parseFloat(gain.toFixed(2)),
            gainPercent: parseFloat(gainPercent.toFixed(2)),
          };
        } catch (err) {
          console.error(`Failed to fetch price for ${stock.stockName}:`, err.message);
          return { ...stock, currentPrice: null, gain: null, gainPercent: null, error: "Price fetch failed" };
        }
      })
    );
    res.status(200).json({ success: true, stocks: enrichedStocks });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Cash Functions ---

export const addcash = async (req, res) => {
  const { amount, type, interest, bank, date } = req.body;
  if (!amount || isNaN(amount) || amount <= 0 || !date) {
    return res.status(400).json({ success: false, message: "Invalid or missing fields" });
  }
  try {
    const userId = req.user.id;
    // FIX: Actually call the model to save the data
    const result = await addcashmodel(userId, { amount, type, interest, bank, date });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding cash:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removecash = async (req, res) => {
  const { cashId } = req.body; // Using cashId for consistency
  if (!cashId) {
    return res.status(400).json({ success: false, message: "Cash ID is required" });
  }
  try {
    const userId = req.user.id;
    // FIX: Call the correct model function with the right parameters
    const result = await removecashmodel(userId, cashId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error removing cash:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getcash = async (req, res) => {
  try {
    const userId = req.user.id;
    // FIX: Call the correct model function
    const cashHoldings = await getcashmodel(userId);

    const dataWithInterest = cashHoldings.map((item) => {
      const interestEarned = calculateMonthlyInterest(item.amount, item.interest, item.date);
      let gainPercent = 0;
      if (item.amount > 0) {
        gainPercent = (interestEarned / item.amount) * 100;
      }
      return {
        ...item,
        interestEarned: parseFloat(interestEarned.toFixed(2)),
        currentValue: parseFloat((parseFloat(item.amount) + parseFloat(interestEarned)).toFixed(2)),
        gainPercent: parseFloat(gainPercent.toFixed(2)),
      };
    });
    res.status(200).json({ success: true, data: dataWithInterest });
  } catch (error) {
    console.error("Error fetching cash:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Gold Functions ---

export const addgold = async (req, res) => {
  const { quantityInGrams, purchasePricePerGram, purchaseDate } = req.body;
  if (!quantityInGrams || !purchasePricePerGram || !purchaseDate) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  try {
    const userId = req.user.id;
    // FIX: Pass the purchaseDate to the model
    const result = await addgoldmodel(userId, { quantityInGrams, purchasePricePerGram, purchaseDate });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding gold:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removegold = async (req, res) => {
  const { goldId } = req.body;
  if (!goldId) {
    return res.status(400).json({ success: false, message: "Gold ID is required" });
  }
  try {
    const userId = req.user.id;
    const result = await removegoldmodel(userId, goldId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error removing gold:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getgold = async (req, res) => {
  try {
    const userId = req.user.id;
    const goldHoldings = await getgoldmodel(userId);
    const enrichedGold = await Promise.all(
      goldHoldings.map(async (gold) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d`;
          const response = await axios.get(url);
          const livePricePerOunce = response.data.chart.result?.[0]?.meta?.regularMarketPrice;

          if (livePricePerOunce == null) throw new Error("Price not available from API");
          
          const livePricePerGram = livePricePerOunce / 31.1035;
          const initialInvestment = gold.quantityInGrams * gold.purchasePricePerGram;
          const currentValue = gold.quantityInGrams * livePricePerGram;
          const totalGain = currentValue - initialInvestment;
          const gainPercent = (totalGain / initialInvestment) * 100;

          return {
            ...gold,
            livePricePerGram: parseFloat(livePricePerGram.toFixed(2)),
            currentValue: parseFloat(currentValue.toFixed(2)),
            totalGain: parseFloat(totalGain.toFixed(2)),
            gainPercent: parseFloat(gainPercent.toFixed(2)),
          };
        } catch (err) {
          console.error(`Failed to fetch price for Gold (GC=F):`, err.message);
          return { ...gold, livePricePerGram: null, currentValue: null, totalGain: null, gainPercent: null, error: "Price fetch failed" };
        }
      })
    );
    res.status(200).json({ success: true, gold: enrichedGold });
  } catch (error) {
    console.error("Error fetching gold holdings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- NEW: Bond Functions ---
export const addbond = async (req, res) => {
  const { bondName, issueDate, maturityDate, principalAmount, couponRate } = req.body;
  if (!bondName || !issueDate || !maturityDate || !principalAmount || couponRate === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required" });
  }
  try {
      const userId = req.user.id;
      const result = await addbondmodel(userId, { bondName, issueDate, maturityDate, principalAmount, couponRate });
      res.status(201).json(result);
  } catch (error) {
      console.error("Error adding bond:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removebond = async (req, res) => {
  const { bondId } = req.body;
  if (!bondId) {
      return res.status(400).json({ success: false, message: "Bond ID is required" });
  }
  try {
      const userId = req.user.id;
      const result = await removebondmodel(userId, bondId);
      res.status(200).json(result);
  } catch (error) {
      console.error("Error removing bond:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getbonds = async (req, res) => {
  try {
      const userId = req.user.id;
      const bonds = await getbondsmodel(userId);

      const enrichedBonds = bonds.map(bond => {
          const interestAccrued = calculateBondInterest(bond.principalAmount, bond.couponRate, bond.issueDate);
          const currentValue = parseFloat(bond.principalAmount) + interestAccrued;
          
          return {
              ...bond,
              interestAccrued,
              currentValue: parseFloat(currentValue.toFixed(2)),
          };
      });

      res.status(200).json({ success: true, bonds: enrichedBonds });
  } catch (error) {
      console.error("Error fetching bonds:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- REVISED Dashboard Controller Function ---
export const getDashboard = async (req, res) => {
  try {
      const userId = req.user.id;

      // --- 1. Fetch all data in parallel ---
      const [stocks, gold, cash, bonds] = await Promise.all([
          getstocksmodel(userId),
          getgoldmodel(userId),
          getcashmodel(userId),
          getbondsmodel(userId)
      ]);

      

      // --- 2. Enrich Data and Calculate Summaries ---
      const enrichedStocks = await Promise.all(stocks.map(async (stock) => {
          try {
              const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.stockName}?interval=1d&range=2d`;
              const response = await axios.get(url);
              const meta = response.data.chart.result?.[0]?.meta;
              const currentPrice = meta?.regularMarketPrice;
              const previousClose = meta?.chartPreviousClose;
              if (!currentPrice || !previousClose) return { ...stock, currentValue: 0, gain: 0, dayChange: 0, dayChangePercent: 0, name: stock.stockName };
              
              const currentValue = currentPrice * stock.stockQuantity;
              const gain = currentValue - (stock.stockPrice * stock.stockQuantity);
              const dayChange = (currentPrice - previousClose) * stock.stockQuantity;
              const dayChangePercent = ((currentPrice - previousClose) / previousClose) * 100;
              return { ...stock, currentValue, gain, dayChange, dayChangePercent, name: stock.stockName };
          } catch {
              return { ...stock, currentValue: 0, gain: 0, dayChange: 0, dayChangePercent: 0, name: stock.stockName };
          }
      }));

      let goldSummary = { value: 0, gain: 0, name: "Gold" };
      try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=2d`;
          const response = await axios.get(url);
          const meta = response.data.chart.result?.[0]?.meta;
          if (meta?.regularMarketPrice) {
              const livePricePerGram = meta.regularMarketPrice / 31.1035;
              gold.forEach(h => {
                  const currentValue = h.quantityInGrams * livePricePerGram;
                  goldSummary.value += currentValue;
                  goldSummary.gain += currentValue - (h.quantityInGrams * h.purchasePricePerGram);
              });
          }
      } catch {}

      const enrichedCash = cash.map(item => {
          const interestEarned = calculateMonthlyInterest(item.amount, item.interest, item.date);
          return { ...item, currentValue: parseFloat(item.amount) + interestEarned, gain: interestEarned, name: item.bank };
      });
      const cashSummary = {
          value: enrichedCash.reduce((sum, c) => sum + c.currentValue, 0),
          gain: enrichedCash.reduce((sum, c) => sum + c.gain, 0),
      };

      const enrichedBonds = bonds.map(bond => {
          const interestAccrued = calculateBondInterest(bond.principalAmount, bond.couponRate, bond.issueDate);
          return { ...bond, currentValue: parseFloat(bond.principalAmount) + interestAccrued, gain: interestAccrued, name: bond.bondName };
      });
      const bondSummary = {
          value: enrichedBonds.reduce((sum, b) => sum + b.currentValue, 0),
          gain: enrichedBonds.reduce((sum, b) => sum + b.gain, 0),
      };

      const stockSummary = {
          value: enrichedStocks.reduce((sum, s) => sum + s.currentValue, 0),
          gain: enrichedStocks.reduce((sum, s) => sum + s.gain, 0),
      };
      
      // --- 3. Aggregate Totals & Breakdowns ---
      const totalPortfolioValue = stockSummary.value + goldSummary.value + cashSummary.value + bondSummary.value;
      const totalGainLoss = stockSummary.gain + goldSummary.gain + cashSummary.gain + bondSummary.gain;
      const totalDayChange = enrichedStocks.reduce((sum, s) => sum + s.dayChange, 0);

      const breakdown = {
          stocks: stockSummary,
          gold: goldSummary,
          cash: cashSummary,
          bonds: bondSummary,
      };

      // --- 4. Prepare Data for Charts and Lists ---
      const assetAllocation = Object.entries(breakdown).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value.value
      })).filter(asset => asset.value > 0);

      const allHoldings = [
          ...enrichedStocks,
          goldSummary,
          ...enrichedCash,
          ...enrichedBonds,
      ].sort((a, b) => b.gain - a.gain);

      const topPerformers = allHoldings.filter(h => h.gain > 0).slice(0, 3);
      const worstPerformers = allHoldings.filter(h => h.gain < 0).sort((a,b) => a.gain - b.gain).slice(0, 3);

      // --- 5. Send consolidated response ---
      res.status(200).json({
          success: true,
          kpis: { totalPortfolioValue, totalGainLoss, totalDayChange },
          breakdown,
          charts: {
              assetAllocation,
              performance: generateDummyPerformanceData(),
          },
          marketMovers: enrichedStocks.map(s => ({
              name: s.stockName,
              value: s.currentValue / s.stockQuantity,
              change: s.dayChangePercent,
          })),
          lists: { topPerformers, worstPerformers },
      });

  } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

function generateDummyPerformanceData() {
  const data = [];
  let value = 250000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // More volatile: Range ~ [-7000, +7000]
    const dailyChange = Math.random() * 14000 - 7000;
    value += dailyChange;

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value)
    });
  }
  return data;
}


// --- Remember to add the route for `/dashboard` in `route.js` ---
