---
title: ScatterID
type: CAPSTONE
order: 1
stack: Python, ML-DSA-65 (FIPS 204), Hyperledger Fabric
duration: Final year project
impact: Public on GitHub with docs and audit history.
link: https://github.com/0x4rc4n3
summary: A post-quantum decentralized identity system. Credentials are signed with lattice-based signatures and anchored on a tamper-evident ledger, so no raw personal data is stored centrally.
---
## The Problem
Centralized identity databases hold raw personal data, which makes them high-value breach targets. The goal was to prove a credential is genuine without storing personal data in one place, and to stay secure against future quantum attacks.

## The Approach
- **Post-quantum signatures:** credentials become privacy-preserving hash commitments, signed with FIPS 204 ML-DSA-65 lattice-based signatures.
- **Tamper-evident ledger:** a permissioned Hyperledger Fabric network anchors credential fingerprints instead of a central credential database.
- **Client tooling:** a client SDK and offline verification tooling let anyone check a credential.

## The Security Audit
I ran a self-directed audit of the finished system, fixed what I found, and re-verified each fix by running the system.
- **Finding:** an unauthenticated admin interface, fixed and re-verified.
- **Finding:** a disabled TLS certificate check, fixed and re-verified.
- **Key learning:** build the system, then attack your own work. Source code, documentation and audit history are public on GitHub.
