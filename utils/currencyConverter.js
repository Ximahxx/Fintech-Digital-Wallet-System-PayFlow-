// ===========================================================
// 💱 Currency Converter Utility - Converts Between Currencies
// ===========================================================

const exchangeRates = {
  NGN: { USD: 0.0012, EUR: 0.0011 },
  USD: { NGN: 840, EUR: 0.91 },
  EUR: { NGN: 910, USD: 1.1 },
};

// ✅ Function: Convert amount from one currency to another
exports.convertCurrency = (amount, from, to) => {
  if (from === to) return amount; // No conversion needed
  return amount * (exchangeRates[from]?.[to] || 1); // Defaults to 1 if missing
};
