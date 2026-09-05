# Netlify Edge Proxy Redirect Precedence Verification

**Evaluation Date:** 2026-09-05  
**Evaluation Time:** 07:40:24 UTC (10:40:24 EEST)  
**Evaluator:** Antigravity agent (session `e622fc11-cdd7-44ee-a2c4-e9a9ce4bcede`)  
**Repository:** `ux-fotisp/GlycoGourmet`  
**DAVE+R Evidence ID:** `EVD-2026-006`  
**Provenance:** `observed`  

---

## 1. Test Objective & Methodology

Verify whether Netlify's edge routing engine respects rule precedence for `/api/*` proxies over the single-page application (SPA) catch-all rewrite (`/* -> /index.html 200`).

### Test Assertions
* **PASS Criteria:** Response status and Content-Type are anything other than `200 text/html` (e.g. `502 text/plain` when the upstream host is unprovisioned). This proves that the `/api/*` edge proxy rewrite fired and attempted to route upstream.
* **FAIL Criteria:** Response is `200 text/html` on any `/api/*` path on the branch under test (indicating the SPA catch-all intercepted the request and returned `index.html`, which causes `SyntaxError: Unexpected token '<'` / "Network error during login").

---

## 2. Empirical Curl Results

The following test was executed across three environments:
1. `deploy-preview-28` (`fix/login-network-error`): Contains PR #28's `/api/*` proxy rewrite in `public/_redirects` and `netlify.toml`.
2. `deploy-preview-26` (`feat/dave-r-governance-workers`): Negative control (governance branch; lacks PR #28 redirect rule).
3. Production (`glycogourmet.netlify.app`): Negative control (master branch baseline; lacks PR #28 redirect rule).

```bash
curl -sS -o /dev/null -w "%{http_code} %{content_type}\n" <url>/api/auth/local
curl -sS -o /dev/null -w "%{http_code} %{content_type}\n" <url>/api/health
```

### Raw Terminal Output Summary

| Environment | Target URL | HTTP Code | Content-Type Header | Verdict | Interpretation |
|---|---|---|---|---|---|
| **Deploy Preview #28** (`fix/login-network-error`) | `https://deploy-preview-28--glycogourmet.netlify.app/api/auth/local` | **502** | `text/plain; charset=utf-8` | **PASS** | Edge proxy rule fired; attempted upstream connection to `api.glycogourmet.com` (NXDOMAIN). |
| **Deploy Preview #28** (`fix/login-network-error`) | `https://deploy-preview-28--glycogourmet.netlify.app/api/health` | **502** | `text/plain; charset=utf-8` | **PASS** | Edge proxy rule fired; attempted upstream connection to `api.glycogourmet.com` (NXDOMAIN). |
| **Deploy Preview #26** (`feat/dave-r-governance-workers`) | `https://deploy-preview-26--glycogourmet.netlify.app/api/auth/local` | **200** | `text/html; charset=UTF-8` | Control Baseline | Lacks PR #28 proxy; intercepted by `/* /index.html 200` SPA catch-all. |
| **Deploy Preview #26** (`feat/dave-r-governance-workers`) | `https://deploy-preview-26--glycogourmet.netlify.app/api/health` | **200** | `text/html; charset=UTF-8` | Control Baseline | Lacks PR #28 proxy; intercepted by `/* /index.html 200` SPA catch-all. |
| **Production** (`master` baseline) | `https://glycogourmet.netlify.app/api/auth/local` | **200** | `text/html; charset=UTF-8` | Control Baseline | Lacks PR #28 proxy; intercepted by `/* /index.html 200` SPA catch-all. |
| **Production** (`master` baseline) | `https://glycogourmet.netlify.app/api/health` | **200** | `text/html; charset=UTF-8` | Control Baseline | Lacks PR #28 proxy; intercepted by `/* /index.html 200` SPA catch-all. |

---

## 3. Detailed Response Header Trace

### Deploy Preview #28 (`/api/auth/local`)
```http
HTTP/1.1 502 Bad Gateway
Age: 0
Cache-Control: private,max-age=0
Cache-Status: "Netlify Edge"; fwd=miss; fwd-status=502
Content-Length: 0
Content-Type: text/plain; charset=utf-8
Date: Sat, 05 Sep 2026 07:40:22 GMT
Server: Netlify
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Nf-Request-Id: 01M1R85SZB8F6K4Y93W3G4Z12W
X-Robots-Tag: noindex
```

### Deploy Preview #28 (`/api/health`)
```http
HTTP/1.1 502 Bad Gateway
Age: 0
Cache-Control: private,max-age=0
Cache-Status: "Netlify Edge"; fwd=miss; fwd-status=502
Content-Length: 0
Content-Type: text/plain; charset=utf-8
Date: Sat, 05 Sep 2026 07:40:23 GMT
Server: Netlify
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Nf-Request-Id: 01M1R85TMQFPX1J4ZCCN3DT4KK
X-Robots-Tag: noindex
```

---

## 4. Redirect Rule Order Audit

In `fix/login-network-error` (PR #28):

### `public/_redirects`
```text
/api/*  https://api.glycogourmet.com/api/:splat  200!
/*    /index.html   200
```

### `netlify.toml`
```toml
[[redirects]]
  from = "/api/*"
  to = "https://api.glycogourmet.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Conclusion:** Rule ordering in PR #28 is verified correct. The edge proxy rule with `force = true` (`200!`) preempts the SPA fallback as intended, resolving the HTML interception defect. The HTTP 502 occurs solely because the upstream backend (`api.glycogourmet.com`) has not yet been provisioned.
