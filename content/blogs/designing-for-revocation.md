---
title: "Designing for Revocation Without a Central Database"
date: 2026-08-16
summary: "How ScatterID avoids a centralized database by anchoring revocation records directly on the Hyperledger Fabric ledger under the same trust model."
order: 4
---
Most identity systems solve revocation the easy way: a central database with a status column. Need to revoke a credential? Flip a flag. It works, but it reintroduces the exact thing a decentralized credential system is supposed to avoid — a single authoritative store that every verifier has to trust and query.

For ScatterID, the constraint was: revocation has to be checkable without requiring a live, centrally-controlled endpoint every verifier depends on.

The approach follows the same pattern used for issuance: revocation status is anchored on the permissioned Hyperledger Fabric ledger, as its own tamper-evident record tied to the original credential commitment — not stored as a mutable field in a separate database that a single party controls. A verifier checking a credential checks the ledger for both the issuance anchor and any revocation record associated with it, under the same trust model either way.

This doesn't eliminate the tradeoffs. Ledger-anchored revocation is append-only by nature, which is good for tamper-evidence but means revocation records accumulate rather than simply overwrite — a design constraint any system built this way has to account for over a long enough timeline. And issuers still need to be trusted to actually revoke promptly when they should; no architecture solves that part.

What the architecture does solve is the single-point-of-failure problem. No verifier has to trust one party's live database uptime, response honesty, or continued existence years after a credential was issued. They trust the ledger's consensus instead — the same trust boundary already established at issuance.
