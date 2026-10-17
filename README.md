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

## CMS quick guide

Open [the CMS](https://0x4rc4n3.vercel.app/admin/) and sign in with a GitHub fine-grained token limited to this repository, with **Contents: read and write**. Edit **Profile & Site**, **Works**, or **Blogs**, then publish; the CMS commits to `main` and Vercel rebuilds the site. For a new blog, add a title, date, short summary, and Markdown body. Keep the token private.
