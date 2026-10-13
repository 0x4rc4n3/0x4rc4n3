# Mudassir Javed (0x4rc4n3)

**Security Engineer | Post-Quantum Cryptography | Security Architecture | CTF**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0x4rc4n3-blue?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/0x4rc4n3/)
[![Website](https://img.shields.io/badge/Website-scatterid.tech-blue)](https://www.scatterid.tech/)
[![Email](https://img.shields.io/badge/Email-Contact-red?logo=gmail&logoColor=white)](mailto:mudassirbhatti276@gmail.com)

---

## Research Interests

- **Primary:** Post-quantum cryptography and lattice-based signatures (NIST FIPS 204, ML-DSA)
- **Secondary:** Verifiable credentials, decentralized identity (DID), permissioned ledgers, crypto-agility

---

## Experience

- **Security Engineer**, Rynex Security (Jun 2026 - Present, hybrid)
- **Cyber Security Intern**, Digital Empowerment Network (Jul - Sep 2025, remote)

---

## Projects

### ScatterID: Post-Quantum Credential Verification (Final Year Project)
Identity verification infrastructure built on salted SHA3-256 hash commitments with selective disclosure, RFC 8785 (JCS) canonicalization, FIPS 204 **ML-DSA-65** signatures, and Hyperledger Fabric anchoring for issuance and revocation state.

- Verification gateway (Express), crypto microservice (Flask), Vault-backed key storage
- Honest by design: uses commitments, **not** zero-knowledge proofs ([why](https://www.scatterid.tech/blog))
- Exhibited at the 2nd Industrial Open House, KFUEIT
- [Repository](https://github.com/0x4rc4n3/ScatterID) | [Docs and blog](https://www.scatterid.tech/)

### Apex-PQ: Post-Quantum DID Portal Prototype
Prototype university identity portal using **ML-DSA-44** (via liboqs) for challenge-response login, `did:key` identifiers, a Chrome MV3 wallet extension, and a 3-replica hash-chained SQLite ledger (SHA3-256) with a 2-of-3 write quorum. Dockerized. Educational prototype, not production software.

- [Repository](https://github.com/0x4rc4n3/Apex-PQ)

### QuantX: Crypto-Agile Hybrid Auth SDK (design stage)
Architecture and specification for a hybrid classical + PQC authentication engine where swapping algorithms is a constructor argument, not a rewrite. Built on `cryptography` and `liboqs`; no hand-rolled primitives.

- [Repository](https://github.com/0x4rc4n3/QuantX)

---

## Writing

Technical articles at [scatterid.tech/blog](https://www.scatterid.tech/blog): ML-DSA vs RSA/ECDSA, designing for revocation, offline verification, lattice cryptography explained, and self-auditing your own system.

---

## CTF and Hackathons

- **Top 10 Finalist**, Ignite Regional CTF Hackathon (crypto, reverse engineering, forensics)
- **Platform Engineer**, University CTF and Hackathon (scoring engine, web and crypto challenges)
- Platforms: OverTheWire, TryHackMe, picoCTF, Advent of Code

---

## Leadership

**Cybersecurity Society, KFUEIT: Executive Board and Infrastructure Lead**

- Ran weekend workshops for 100+ juniors on Linux, Bash, and Wireshark
- Organized mini-CTFs and alumni walkthroughs
- Served across all 4 club cabinets (events, training, infrastructure)

---

## Certifications

- ISC2 Certified in Cybersecurity (CC)
- NAVTTC (Govt. of Pakistan), Digital Forensics and Cyber Security certificate course, Grade A (May - Aug 2023)
- Offensive-security training aligned with the CEH curriculum, OfeHunar Pakistan (Govt.-sponsored; training, not the EC-Council exam)

---

## Skills

Python, C/C++, Assembly, Bash, SQL, TypeScript/Node.js, Flask, Docker, Git, Linux (Kali/Ubuntu), Wireshark, liboqs, Hyperledger Fabric (basics)

---

## Education

**BSc Cyber Security**, Khwaja Fareed University of Engineering and IT (KFUEIT), 2022-2026
Coursework: Cryptography, Network Defense, Digital Forensics, Applied Cryptology

## Portfolio Website and CMS

This repository also contains the portfolio website source. Vercel builds the static site with `npm run build` and serves the generated `dist/` directory. The Vercel settings are recorded in `vercel.json` so the build behavior is reproducible.

- **Site content:** `content/site.json`, `content/works/`, and `content/blogs/`
- **CMS:** open `/admin/` on the deployed site; the CMS backend is configured for `0x4rc4n3/0x4rc4n3` on `main`
- **Publishing:** CMS edits are committed to GitHub; Vercel rebuilds from the updated branch
- **Local preview build:** run `npm run build`, then serve `dist/` with any static file server

The GitHub Actions workflow only validates that the site builds; Vercel is the deployment host. Keep any CMS access token private and restrict it to this repository with only the required contents permissions.

---

## Site notes (build, SEO, security)

- `npm run build` generates `dist/` **and validates it**: required front matter, internal links/assets, one `<h1>` per page, alt text on every image, and no inline scripts/styles (the CSP forbids them). The GitHub Action runs the same command, so a broken link fails CI.
- Generated automatically: canonical URLs, Open Graph/Twitter cards, JSON-LD (Person, BlogPosting), `sitemap.xml`, `robots.txt`, `feed.xml` (RSS), `404.html`, `/.well-known/security.txt`.
- Security headers and CSP live in `vercel.json`. After changing scripts, fonts or embeds, deploy a preview and check the browser console for CSP violations. The `/admin/` CMS has its own, looser CSP and loads a version-pinned, SRI-checked Sveltia CMS build; bump the version and hash together.
- Optional site.json fields: `formAction` (Formspree URL; otherwise the form opens the visitor's mail app), `contact.phone` (empty = hidden), `contact.website`.
- Optional project fields: `website` (extra button) and `imageAlt` (alt text for the cover image).
- Markdown supports headings, lists (ordered and unordered), blockquotes, fenced code blocks, links, images, bold/italic/inline code. Only http(s), mailto, tel and relative URLs are allowed in links.

### Resume download
Upload the PDF in the CMS (Profile & Site > Profile > Resume), or put it in `static/uploads/` and set `resume` in `content/site.json`. The **DOWNLOAD RESUME** button (Home + Contact) appears automatically and always downloads as `Mudassir-Javed-Resume.pdf`, whatever the uploaded file is called. No file = no button.

### Blog categories and search
- Category = the `category` field of a post. Each one gets its own page (`/blogs/category/<name>/`) and a filter button with a count. Edit order and descriptions in the CMS under Profile & Site > Blog Categories (`content/categories.json`). A new category needs no setup: type it in a post.
- Search runs in the browser over `search-index.json` (title, category, summary and full text, rebuilt on every build). `/blogs/?q=word` opens with a search already filled in.

### Real visitor counter (one-time setup)
The footer number is real: `api/visitors.js` counts each browser once and returns the total from Redis.
1. Vercel dashboard > your project > **Storage** > create an **Upstash Redis** database (free plan is enough) and connect it to the project. This adds the environment variables automatically (`KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_*`).
2. Redeploy. Until then, or when running locally, the footer shows `----` instead of a made-up number.
3. To start from a number other than 0, set the key `portfolio:visitors` in the Upstash console.
Bots (by user-agent) and requests that don't come from the site's own pages are not counted. It's a unique-browser count, not a security-grade analytics tool.
