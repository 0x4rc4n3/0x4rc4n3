---
title: "ScatterID"
type: CAPSTONE
order: 1
image: /uploads/scatterid-card.jpg
stack: Python, ML-DSA-65 (FIPS 204), Hyperledger Fabric
duration: Final year project
impact: Exhibited at KFUEIT Industrial Open House.
link: https://github.com/0x4rc4n3/ScatterID
summary: A post-quantum identity verification framework using signed commitments, selective disclosure and ledger anchoring.
---
## The problem
Centralized identity databases hold raw personal data and create high-value breach targets. ScatterID explores how a credential can be verified without placing personal data in one central store.
## The approach
- **Post-quantum signatures:** FIPS 204 ML-DSA-65 signs credential commitments.
- **Canonical commitments:** RFC 8785 JSON canonicalization and salted SHA3-256 commitments keep verification deterministic.
- **Ledger anchoring:** Hyperledger Fabric records issuance and revocation state without storing raw identity data.
- **Honest privacy claims:** ScatterID uses commitments and minimal-claim presentation; it does not claim to implement zero-knowledge proofs.
## Links
[Source repository](https://github.com/0x4rc4n3/ScatterID) · [Project website](https://www.scatterid.tech/)
