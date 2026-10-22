(function(root){
function num(v){v=Number(v);return isFinite(v)&&v>0?v:0}
function calculate(o){
  var runs=num(o.runsPerDay),tin=num(o.tokensIn),tout=num(o.tokensOut),days=num(o.daysPerMonth)||30;
  var cache=Math.min(Math.max(Number(o.cacheShare)||0,0),100)/100;
  var pIn=num(o.priceIn),pOut=num(o.priceOut),pCache=num(o.priceCache);
  var inCost=tin*(1-cache)*pIn/1e6, cacheCost=tin*cache*pCache/1e6, outCost=tout*pOut/1e6;
  var perRun=inCost+cacheCost+outCost, perDay=perRun*runs;
  return {perRun:perRun,perDay:perDay,perMonth:perDay*days,days:days,inCost:inCost,cacheCost:cacheCost,outCost:outCost,
    outShare:perRun?outCost/perRun:0,cache:cache,runs:runs,tokensIn:tin,tokensOut:tout};
}
function tips(r){
  var t=[];
  if(r.cache<0.5&&r.tokensIn>0)t.push("Cache share is under 50%: keep the stable prefix (system prompt, tools, docs) first and unchanged so prompt caching can hit.");
  if(r.outShare>0.5)t.push("Output tokens are over half of the cost: ask for terse output, structured results instead of prose, and cap max output.");
  if(r.runs>=24)t.push("Many runs per day: skip runs when nothing changed (cheap pre-check in plain code) or lower the frequency.");
  if(r.tokensIn>50000)t.push("Large inputs: trim context, summarize history, load files on demand instead of up front.");
  t.push("Route simple steps (classification, extraction) to a smaller model; reserve the large one for hard steps.");
  t.push("Set a hard budget or run-count limit per cron job so a loop cannot run away.");
  return t;
}
function markdown(o,r){
  var f=function(x){return "$"+x.toFixed(x<1?4:2)};
  return ["# Agent cron cost estimate","",
  "- Runs/day: "+r.runs,"- Tokens per run: "+r.tokensIn+" in / "+r.tokensOut+" out","- Cache share of input: "+Math.round(r.cache*100)+"%",
  "- Prices per 1M tokens (user-entered, example values unless you changed them): in "+o.priceIn+", cache read "+o.priceCache+", out "+o.priceOut,"",
  "| Period | Cost |","|---|---|","| Per run | "+f(r.perRun)+" |","| Per day | "+f(r.perDay)+" |","| Per month ("+r.days+" days) | "+f(r.perMonth)+" |","",
  "## Tips"].concat(tips(r).map(function(x){return "- "+x})).concat(["","_Estimate only. Ignores cache-write surcharges, tool-call overhead and retries._"]).join("\n");
}
var api={calculate:calculate,tips:tips,markdown:markdown};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AgentCalc=api;
})(typeof window!=="undefined"?window:this);
