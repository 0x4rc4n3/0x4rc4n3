# Mudassir Javed (0x4rc4n3)

**Security Engineer | Post-Quantum Cryptography | Identity Systems | CTF**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0x4rc4n3-blue?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/0x4rc4n3/)
[![Website](https://img.shields.io/badge/Website-0x4rc4n3.vercel.app-blue)](https://0x4rc4n3.vercel.app)
[![ScatterID](https://img.shields.io/badge/ScatterID-scatterid.tech-blue)](https://www.scatterid.tech/)
[![Email](https://img.shields.io/badge/Email-Contact-red?logo=gmail&logoColor=white)](mailto:mudassirbhatti276@gmail.com)

---

## Research Interests

- **Primary:** Post-quantum cryptography and lattice-based signatures (NIST FIPS 204 ML-DSA)
- **Secondary:** Verifiable credentials, decentralized identity (DID), permissioned ledgers, crypto-agility, security architecture

---

## Experience

- **Security Engineer**, Rynex Security (Jun 2026 – Present, hybrid)  
  Applied security engineering focused on assessment, hardening, and secure system design.

- **Cyber Security Intern**, Digital Empowerment Network (Jul – Sep 2025, remote)  
  Supported security operations and practical defensive work in a remote internship setting.

---

## Featured Projects

### ScatterID — Post-Quantum Credential Verification (Capstone)
End-to-end identity verification infrastructure that signs privacy-preserving hash commitments with **FIPS 204 ML-DSA-65**, anchors credential state on a permissioned **Hyperledger Fabric** ledger, and supports offline verification. Designed for data minimization: raw personal attributes never leave the client.

- Self-directed security audit: discovered and remediated an unauthenticated admin interface and a disabled TLS certificate check; re-verified every fix by running the full system.
- Delivered TypeScript SDK, crypto microservice, verification gateway, Vault-backed key storage, and public documentation + audit history.
- Exhibited at the 2nd Industrial Open House, KFUEIT.
- [Repository](https://github.com/0x4rc4n3/ScatterID) · [Docs & blog](https://www.scatterid.tech/)

### Apex-PQ — Post-Quantum DID Portal Prototype
University identity portal prototype using **ML-DSA-44** (liboqs) for passwordless challenge-response login, `did:key`-style identifiers, a Chrome MV3 wallet extension with encrypted key vault, and a 3-replica SHA3-256 hash-chained SQLite ledger with 2-of-3 write quorum. Fully Dockerized.

- Explicit threat model and known limitations documented; educational prototype, not production software.
- [Repository](https://github.com/0x4rc4n3/Apex-PQ)

### QuantX — Crypto-Agile Hybrid Auth SDK (Design Stage)
Architecture and specification for a hybrid classical + post-quantum authentication engine where algorithm choice, storage backend, and key custody are constructor arguments instead of rewrites. Built exclusively on established libraries (`cryptography`, `liboqs`); no hand-rolled primitives.

- [Repository](https://github.com/0x4rc4n3/QuantX)

---

## Writing

Technical articles at [scatterid.tech/blog](https://www.scatterid.tech/blog) covering ML-DSA vs RSA/ECDSA, designing for revocation, offline verification, lattice cryptography explained, data minimization without overclaiming ZK, and self-auditing a production-bound system.

---

## CTF & Competitions

- **Top 10 Finalist**, Ignite Regional CTF Hackathon — cryptography, reverse engineering, and network forensics against national university teams.
- **Platform Infrastructure Engineer**, University CTF & Hackathon — designed and built the scoring platform; authored web-exploitation and cryptography challenges.
- Ongoing practice: TryHackMe, OverTheWire (Bandit), picoCTF, Advent of Code.

---

## Leadership

**Executive Board Member & Infrastructure Lead — Cybersecurity Society, KFUEIT** (multi-year)

- Designed and delivered recurring workshops and mini-CTF mentorship series on Linux, Bash, and network traffic analysis for **100+ undergraduates**.
- Served across all four club cabinets, owning event execution and technical infrastructure deployment.

---

## Certifications & Training

- **ISC2 Certified in Cybersecurity (CC)** — examination passed, 2026
- **NAVTTC** (Government of Pakistan) — Cyber Security & Digital Forensics course, Grade A (May–Aug 2023)
- Government-sponsored offensive-security training aligned with the CEH curriculum (training only; not the EC-Council exam)

---

## Skills

**Security:** Applied cryptography, post-quantum cryptography (ML-DSA / liboqs), authentication & zero trust, security auditing, vulnerability assessment, network traffic analysis, digital forensics  
**Languages:** Python, TypeScript/Node.js, C/C++, x86 Assembly, Bash, SQL  
**Tools & Platforms:** Linux (Ubuntu, Kali), Docker, Git, Wireshark, Flask, Hyperledger Fabric (basics), HashiCorp Vault

---

## Education

**BS Cyber Security**, Khwaja Fareed University of Engineering & Information Technology (KFUEIT), 2022–2026  
Coursework: Cryptography & Network Security, Applied Cryptology, Digital Forensics, Network Defense, Advanced Database Systems

---

## Portfolio Website

This repository powers the personal site at [0x4rc4n3.vercel.app](https://0x4rc4n3.vercel.app). Content lives in `content/`; the site is statically generated with strong CSP, SEO, and accessibility checks in CI.
