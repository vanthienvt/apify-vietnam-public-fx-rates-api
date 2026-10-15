import { Actor } from 'apify';

await Actor.init();
const input = (await Actor.getInput()) || {};
const currencies =
  Array.isArray(input.currencies) && input.currencies.length > 0
    ? input.currencies
    : ['USD', 'EUR', 'JPY', 'GBP', 'SGD', 'KRW', 'CNY', 'AUD', 'CAD', 'THB'];
const amount = Number(input.amountInForeignCurrency || 100);

const res = await fetch('https://open.er-api.com/v6/latest/VND');
const data = await res.json();
const rates = data?.rates || {};

const results = [];
for (const code of currencies) {
  const upper = String(code).toUpperCase().trim();
  const vndToForeign = rates[upper];
  if (!vndToForeign) continue;
  const oneUnitInVnd = Number((1 / vndToForeign).toFixed(2));
  results.push({
    currency: upper,
    baseCurrency: 'VND',
    oneUnitInVnd,
    inputAmount: amount,
    convertedToVnd: Number((amount * oneUnitInVnd).toFixed(2)),
    lastUpdatedUtc: data.time_last_update_utc || new Date().toISOString(),
    scrapedAt: new Date().toISOString(),
  });
}

await Actor.pushData(results);
console.log('Pushed', results.length, 'Vietnam FX rate records to Dataset.');
await Actor.exit();
