---
title: "ML-DSA vs. RSA/ECDSA: What Actually Changes"
date: 2026-08-22
summary: "Security basis, key sizes, performance characteristics, and standard maturity: what actually changes when moving from classical signatures to ML-DSA-65."
order: 6
category: "Post-Quantum"
---
image: /uploads/blog-quantum.svg
imageAlt: Post-quantum cryptography & lattice security editorial illustration
Swapping a signature scheme sounds like a drop-in replacement — same interface, different math. In practice, moving from RSA or ECDSA to ML-DSA (the FIPS 204 standard ScatterID uses) changes more than the algorithm underneath.

**Security basis.** RSA and ECDSA rely on integer factorization and the elliptic curve discrete logarithm problem — both solvable in polynomial time by Shor's algorithm on a sufficiently capable quantum computer. ML-DSA is built on the hardness of lattice problems (specifically, Module-LWE and Module-SIS), which have no known efficient quantum algorithm to date.

**Size.** This is the part people underestimate. An ECDSA P-256 signature is about 64 bytes; an RSA-2048 signature is 256 bytes. ML-DSA-65 signatures (3,309 bytes) and public keys (1,952 bytes) run into the low thousands of bytes each — signatures are roughly 13 times (vs. RSA-2048) to 50 times (vs. ECDSA P-256) larger. For a system issuing and transmitting credentials at scale, that's a real bandwidth and storage cost, not a rounding error.

**Performance characteristics.** Lattice-based signing and verification are generally fast — competitive with or faster than RSA in many benchmarks — but the larger data sizes still ripple through everything downstream: storage schemas, network payloads, QR-code-based offline credential formats, where every extra byte matters for scannability.

**Maturity.** RSA and ECDSA have decades of cryptanalysis, implementation experience, and hardware acceleration behind them. ML-DSA was only finalized in 2024. The underlying math is well-studied — Dilithium, its predecessor, has years of academic scrutiny — but production tooling, library ecosystems, and hardware support are still catching up.

None of this is an argument against migrating. It's an argument for migrating deliberately, with the size and maturity tradeoffs accounted for upfront rather than discovered midway through a deployment.
