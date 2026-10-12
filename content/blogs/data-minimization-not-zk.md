---
title: "ScatterID Doesn't Use Zero-Knowledge Proofs — Here's What It Actually Uses, and Why the Distinction Matters"
date: 2026-08-31
summary: "Why ScatterID uses salted hash commitments and minimal-claim presentation rather than formal zero-knowledge proofs, and why technical precision matters."
order: 9
---
"Zero-knowledge" gets attached to a lot of identity and privacy projects loosely, often as shorthand for "privacy-preserving" in general. It has a precise cryptographic meaning: a zero-knowledge proof lets one party prove a statement is true without revealing anything beyond the truth of that statement — including proving a property about hidden data (like "I'm over 18") without revealing the data itself (like a birthdate).

ScatterID doesn't implement formal zero-knowledge proofs or per-attribute commitment proofs. It uses salted hash commitments and minimal-claim presentation instead — a related but meaningfully different technique, and one that's worth being precise about rather than rounding up to the more fashionable term.

Here's the actual mechanism in the TypeScript SDK flow: the caller's complete claim object is canonicalized, salted, and hashed into a one-way SHA3-256 commitment before the SDK sends a request to the issuance API. What gets signed and anchored on the ledger is that commitment, not the raw claim. Verification recomputes the commitment from the claim and salt supplied by the verifier; this does not prove a property about hidden attributes. A deployment should separately review issuer-side handling and logs.

The practical difference: a true ZK proof could let someone prove "I'm over 18" without ever revealing their actual birthdate. ScatterID's commitment scheme means the birthdate itself never sits in a central database or gets broadcast publicly, but if a specific verification requires confirming age, the birthdate attribute is what gets disclosed to that verifier directly.

Both approaches minimize data exposure. They minimize it differently, and for different threat models. Calling a commitment scheme "zero-knowledge" because it sounds more advanced would be technically inaccurate — and precision about what a cryptographic system actually guarantees matters more than how impressive the terminology sounds.
