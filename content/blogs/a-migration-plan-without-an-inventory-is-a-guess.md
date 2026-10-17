---
title: "A Migration Plan Without an Inventory Is a Guess"
date: "2026-10-18"
summary: "A CBOM is a machine-readable inventory of the cryptography a system uses, and it is the first step of any post-quantum migration."
order: 14
---

Most post-quantum migration talk starts with the algorithm: ML-KEM or ML-DSA, hybrid or pure, which parameter set. That is the second question. The first is simpler and much less comfortable: where is our cryptography today?

Most teams cannot answer it. Cryptography does not live in one module. It sits in application code, TLS configuration, certificates, key stores, third-party libraries, and firmware. Nobody wrote it all down, because nobody had to.

A Cryptography Bill of Materials (CBOM) fixes that. It is a structured, machine-readable inventory of the algorithms, keys, certificates, libraries and protocols used across software and systems, and it extends the SBOM idea to cryptography. CycloneDX added native CBOM support in version 1.6, released in 2024. That means one bill of materials can carry both software components and cryptographic assets. [www.encryptionconsulting.com +2](https://www.encryptionconsulting.com/?p=92398)

Each entry is a cryptographic asset with a type, such as an algorithm, certificate, protocol, or key material, plus details like key size and where it was found. That detail is what makes it useful. A scan can flag algorithms such as RSA, ECDSA, DSA and ECDH as quantum-vulnerable, so migration planning becomes filtering a file instead of holding a meeting. [binarly](https://docs.binarly.io/user-guides/export/cbom)

The timeline gives this weight. NIST finalized FIPS 203, 204 and 205 in August 2024, and its transition roadmap, NIST IR 8547, deprecates quantum-vulnerable algorithms from 2030 and disallows them after 2035. It names a cryptographic inventory as the essential first step. Long-lived data, and systems with long upgrade cycles, cannot wait until the deadline to find out what they depend on. [mondoo](https://mondoo.com/de/xgrep/cbom)

In practice, you build a CBOM by running discovery across several places. That means certificates, code, key stores, and network traffic, then normalizing the findings into CycloneDX with owners and locations. Once it exists, you can diff it between releases and watch quantum-vulnerable entries shrink. [encryptionconsulting](https://www.encryptionconsulting.com/?p=94481)

The tradeoff is that a CBOM is only as good as the discovery behind it. Generating one is hard when cryptography is configuration-driven, when the same algorithm goes by different names across tools, and when it is unclear whether a component provides cryptography or merely consumes it. A scanner reading source code will not see a cipher suite enabled in a load balancer. An empty result is not proof of safety, and a CBOM generated once and never updated goes stale quickly. [ibm](https://research.ibm.com/publications/the-anatomy-of-cryptography-bills-of-materials-standardization-and-practice-in-cyclonedx)

So treat it as a map that needs maintaining, not a certificate that you are ready. It tells you where to look, who owns each piece, and what to replace first. Everything else in a PQC migration depends on it.

Precision matters more than speed here. You cannot replace what you have not found.
