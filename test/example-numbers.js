// Prints the worked example used in guides/lower-agent-cron-costs.html (keep page and this in sync).
const c = require("../tools/calc.js");
const b = { runsPerDay: 24, daysPerMonth: 30, tokensIn: 40000, tokensOut: 2000, cacheShare: 60, priceIn: 3, priceCache: 0.3, priceOut: 15 };
const steps = [
  ["baseline", b],
  ["every 2h", { ...b, runsPerDay: 12 }],
  ["+ half context", { ...b, runsPerDay: 12, tokensIn: 20000 }],
  ["+ 80% cache", { ...b, runsPerDay: 12, tokensIn: 20000, cacheShare: 80 }],
];
for (const [n, o] of steps) { const r = c.calculate(o); console.log(n, r.perRun.toFixed(4), r.perMonth.toFixed(2)); }
