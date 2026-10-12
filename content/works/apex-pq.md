---
title: "Apex-PQ"
type: PROTOTYPE
order: 2
image: /uploads/apex-pq-login.png
stack: ML-DSA-44, liboqs, Chrome MV3, SQLite, Docker
duration: University prototype
impact: Demonstrates PQC challenge-response identity flows.
link: https://github.com/0x4rc4n3/Apex-PQ
summary: A post-quantum university identity portal prototype with wallet-based login and a replicated, hash-chained ledger.
---
## What it does
Apex-PQ models a university identity portal where students use a browser wallet and post-quantum signatures to authenticate.
## Key pieces
- Challenge-response login using **ML-DSA-44** via liboqs and `did:key` identifiers.
- Chrome Manifest V3 wallet extension.
- Three-replica, hash-chained SQLite ledger with a 2-of-3 write quorum.
- Dockerized deployment for repeatable evaluation.

This is an educational prototype, not production software.
[View the source repository](https://github.com/0x4rc4n3/Apex-PQ).
