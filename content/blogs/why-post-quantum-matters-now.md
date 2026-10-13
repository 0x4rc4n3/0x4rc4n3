---
title: "Why Post-Quantum Cryptography Matters Now, Not Later"
date: 2026-08-07
summary: "Most of the cryptography protecting data online today relies on math problems solvable by quantum computers. Migrating to post-quantum signatures is needed now."
order: 1
category: "Post-Quantum"
---
Most of the cryptography protecting data online today — RSA, ECDSA, Diffie-Hellman — relies on math problems that are hard for classical computers but not fundamentally hard for a sufficiently large quantum computer. Shor's algorithm, published in 1994, already solves the underlying problems (integer factorization and discrete logarithms) in polynomial time. What's been missing isn't the algorithm — it's hardware capable of running it at the scale current cryptography would require.

That gap is closing, and it doesn't need to close completely to matter. Encrypted data captured today can be stored and decrypted later — an approach known as harvest-now-decrypt-later. Anything that needs to stay confidential for years (medical records, legal documents, identity credentials) is exposed to this threat right now, regardless of when a cryptographically relevant quantum computer actually arrives, because the interception can happen today.

This is why ScatterID uses NIST FIPS 204 ML-DSA-65 lattice-based signatures instead of RSA or ECDSA, even though quantum computers capable of breaking those algorithms don't exist yet. Migrating a live identity system's signature scheme after credentials are already issued is far harder than choosing correctly at the start.

The honest tradeoff: ML-DSA signatures and keys are meaningfully larger than their classical counterparts, and the standard itself is young — FIPS 204 was only finalized in 2024. Tooling, library maturity, and real-world deployment experience are still catching up. Choosing PQC now means accepting some rough edges in exchange for not having to migrate a production credential system under pressure later.

For identity infrastructure specifically, "later" isn't really an option. Credentials issued today may still need to be verifiable in ten or twenty years. The cryptography protecting them has to be chosen for that horizon, not for what's convenient today.
