const assert=require("assert");const c=require("../tools/calc.js");
const o={runsPerDay:10,daysPerMonth:30,tokensIn:1000000,tokensOut:100000,cacheShare:50,priceIn:3,priceCache:0.3,priceOut:15};
const r=c.calculate(o);
assert(Math.abs(r.perRun-3.15)<1e-9);assert(Math.abs(r.perDay-31.5)<1e-9);assert(Math.abs(r.perMonth-945)<1e-9);
assert.strictEqual(c.calculate({}).perMonth,0);
assert(c.calculate({...o,cacheShare:500}).cache===1);
assert(c.markdown(o,r).includes("$945.00"));assert(c.tips(r).length>=2);
console.log("ok");
