---
title: "ScatterID"
type: CAPSTONE
order: 1
image: /uploads/scatterid-card.jpg
stack: Python, TypeScript, ML-DSA-65 (FIPS 204), Hyperledger Fabric, HashiCorp Vault
duration: Final-year capstone
impact: Self-audited end-to-end PQC identity system; exhibited at KFUEIT Industrial Open House; public code, docs and audit history.
link: https://github.com/0x4rc4n3/ScatterID
website: https://www.scatterid.tech/
imageAlt: ScatterID project card
summary: Post-quantum credential verification framework that signs privacy-preserving commitments with ML-DSA-65 and anchors state on a permissioned ledger — without storing raw personal data centrally.
---
## The problem
Centralized identity stores concentrate high-value personal data and become prime breach targets. ScatterID demonstrates how credentials can be issued and verified while keeping raw attributes off the server.

## The approach
- **Post-quantum signatures** — FIPS 204 ML-DSA-65 signs salted SHA3-256 commitments of identity claims.
- **Data minimization by design** — RFC 8785 (JCS) canonicalization + client-side salting; only the commitment ever leaves the device.
- **Ledger anchoring** — Permissioned Hyperledger Fabric records issuance and revocation state without holding plaintext attributes.
- **Honest privacy claims** — Uses cryptographic commitments, not zero-knowledge proofs. Selective disclosure is supported; over-claiming is avoided.
- **Self-audit** — Discovered and fixed an unauthenticated admin interface and a disabled TLS certificate check; every remediation was re-verified by running the live system.

## Deliverables
TypeScript SDK, crypto microservice (Flask + liboqs), verification gateway, Vault-backed key storage, offline verification tooling (Node + Python), full documentation and public audit history.

[Source repository](https://github.com/0x4rc4n3/ScatterID) · [Project site & blog](https://www.scatterid.tech/)
