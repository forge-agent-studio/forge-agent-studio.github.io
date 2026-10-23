const assert = require("assert");
const L = require("../tools/leak.js");
// Fake tokens are assembled at runtime so no secret-looking literal lives in the repo.
const a = "A".repeat(36), d = "7".repeat(24);
const log = [
  "run 14:00 ok, nothing secret here",
  "export ANTHROPIC_API_KEY=" + "sk-" + "ant-" + "api03-" + a,
  "curl -H 'Authorization: Bearer " + "x".repeat(32) + "' https://api.example.com",
  "git push https://forge:" + "hunter2pass" + "@github.com/x/y.git",
  "token " + "ghp_" + a,
  "AWS " + "AKIA" + "ABCDEFGHIJKLMNOP",
  "password = " + "Sup3rS3cretValue",
  "-----BEGIN " + "OPENSSH PRIVATE KEY-----",
  "doppler " + "dp.st." + "prd." + d
].join("\n");
const hits = L.scan(log);
const ids = hits.map(h => h.rule);
["anthropic", "bearer", "urlcred", "github", "aws", "assign", "pem", "doppler"].forEach(id =>
  assert(ids.includes(id), "missing " + id + " in " + ids.join(",")));
assert(!hits.some(h => h.line === 1), "false positive on clean line");
assert(!ids.includes("openai"), "anthropic key double-counted as openai");
hits.forEach(h => assert(!h.preview.includes(a), "preview leaks full secret"));
const red = L.redact(log);
assert(!red.includes(a) && !red.includes("hunter2pass") && !red.includes(d), "redact incomplete");
assert.deepStrictEqual(L.scan("hello world\nno keys"), []);
assert.deepStrictEqual(L.scan(""), []);
console.log("ok", hits.length, "hits");
