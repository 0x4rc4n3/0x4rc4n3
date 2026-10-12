---
title: "Building a TypeScript SDK on Top of a Python-Heavy Cryptographic Core"
date: 2026-08-28
summary: "Ensuring byte-for-byte cryptographic parity across Node.js and Python implementations of RFC 8785 canonicalization and signature verification."
order: 8
---
Most of ScatterID's cryptographic logic — canonicalization, hashing, signature handling — has natural, mature library support in Python. The client-facing SDK needed to be TypeScript, because that's where identity verification actually gets integrated: web apps, browser extensions, Node.js backends. That split created a specific, unglamorous engineering problem: making sure two implementations of the same cryptographic logic, in two different language ecosystems, always agree.

They have to agree exactly. A commitment scheme depending on RFC 8785 canonicalization is only as reliable as its most inconsistent implementation. If the Python side and the TypeScript side serialize the same JSON object differently — different key ordering, different whitespace handling, different number formatting — they'll produce different hash commitments from identical input data. That's not a minor bug; it's a system where two legitimate implementations silently disagree about whether a credential is valid.

The fix wasn't clever. It was disciplined: build offline verifiers in both Node.js and Python, then write parity tests that feed identical inputs through both and assert byte-for-byte identical outputs at every stage — canonicalization, salting, hashing, signature verification. Any divergence fails the build immediately, before it becomes a silent inconsistency discovered by a confused user months later.

The broader lesson generalizes past this project: cross-language cryptographic interoperability isn't something you get by using "the same standard" in both languages. Standards leave implementation choices open — canonical whitespace, number formatting, edge-case handling — and those choices are exactly where two correct implementations quietly stop agreeing. Parity testing against real fixtures, not just unit tests against each language in isolation, is what actually catches it.
