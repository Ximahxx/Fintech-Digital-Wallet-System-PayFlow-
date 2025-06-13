const exchangeRates = {
  NGN: { USD: 0.0012, EUR: 0.0011 },
  USD: { NGN: 840, EUR: 0.91 },
  EUR: { NGN: 910, USD: 1.1 },
};

exports.convertCurrency = (amount, from, to) => {
  if (from === to) return amount;
  return amount * (exchangeRates[from]?.[to] || 1);
};
