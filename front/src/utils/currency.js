export function makeRateMap(rates) {
  const map = {};
  for (const r of rates) map[r.code] = r.value;
  return map;
}

export function convert(amount, from, to, rateMap) {
  if (!rateMap) return amount;
  const fromRate = rateMap[from];
  const toRate = rateMap[to];
  if (fromRate == null || toRate == null) return amount;
  const amountInMXN = amount / fromRate; // since rate is value of 1 MXN in target currency
  return amountInMXN * toRate;
}
