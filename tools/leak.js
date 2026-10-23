// Agent Log Secret Scanner — pattern-based, runs fully client-side (also usable in Node for tests).
(function (root) {
  var RULES = [
    { id: "anthropic", label: "Anthropic API key", re: /sk-ant-[A-Za-z0-9_\-]{20,}/g },
    { id: "openai", label: "OpenAI API key", re: /sk-(?:proj-|svcacct-)?[A-Za-z0-9_\-]{20,}/g },
    { id: "github", label: "GitHub token", re: /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/g },
    { id: "aws", label: "AWS access key id", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
    { id: "google", label: "Google API key", re: /\bAIza[0-9A-Za-z_\-]{35}\b/g },
    { id: "slack", label: "Slack token", re: /\bxox[abprs]-[A-Za-z0-9\-]{10,}/g },
    { id: "stripe", label: "Stripe secret key", re: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/g },
    { id: "doppler", label: "Doppler token", re: /\bdp\.(?:st|pt|sa|ct|scim|audit)\.[A-Za-z0-9_\-.]{20,}/g },
    { id: "telegram", label: "Telegram bot token", re: /\b\d{8,10}:AA[A-Za-z0-9_\-]{33}\b/g },
    { id: "jwt", label: "JWT", re: /\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g },
    { id: "pem", label: "Private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/g },
    { id: "bearer", label: "Bearer token in header", re: /\bBearer\s+[A-Za-z0-9_\-.=]{20,}/g },
    { id: "urlcred", label: "Password inside URL", re: /\b[a-z][a-z0-9+.\-]*:\/\/[^\s:@\/]+:[^\s@\/]{3,}@/gi },
    { id: "assign", label: "password/secret assignment", re: /\b(?:password|passwd|pwd|secret|api[_-]?key|token)\s*[:=]\s*["']?[^\s"',;]{8,}/gi }
  ];

  function mask(s) {
    if (s.length <= 8) return s.slice(0, 2) + "***";
    return s.slice(0, 4) + "***" + s.slice(-2) + " (" + s.length + " chars)";
  }

  function scan(text) {
    text = String(text || "");
    var lines = text.split(/\r?\n/), hits = [], seen = {};
    for (var n = 0; n < lines.length; n++) {
      for (var r = 0; r < RULES.length; r++) {
        var rule = RULES[r], m;
        rule.re.lastIndex = 0;
        while ((m = rule.re.exec(lines[n])) !== null) {
          var key = n + ":" + m.index;
          // skip generic rules if a specific rule already matched at the same spot
          if (seen[key]) continue;
          seen[key] = rule.id;
          hits.push({ line: n + 1, rule: rule.id, label: rule.label, preview: mask(m[0]) });
        }
      }
    }
    return hits;
  }

  function redact(text) {
    var out = String(text || "");
    RULES.forEach(function (rule) {
      out = out.replace(rule.re, function (s) { return "[REDACTED:" + rule.id + "]"; });
    });
    return out;
  }

  var api = { scan: scan, redact: redact, mask: mask, rules: RULES };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.LeakScan = api;
})(this);
