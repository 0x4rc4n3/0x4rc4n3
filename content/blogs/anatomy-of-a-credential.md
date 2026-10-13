---
title: "The Anatomy of a Credential in ScatterID"
date: 2026-08-10
summary: "From canonicalization to salting, SHA3-256 commitments, ML-DSA-65 signatures, and ledger anchoring: how verification works without exposing raw identity data."
order: 2
category: "Identity"
---
image: /uploads/blog-identity.svg
imageAlt: Identity & credentials editorial illustration
A credential in ScatterID isn't a file that gets copied around and trusted at face value — it's the output of a specific process designed so that verification never requires the verifier, or anyone else, to see more than they need to.

Here's the flow, from issuance to verification, at a high level:

**1. Attribute preparation.** The holder's identity attributes are canonicalized using RFC 8785 (JSON Canonicalization Scheme), so the same data always produces the same byte representation regardless of formatting differences.

**2. Salting.** A random secret is generated client-side and combined with the canonicalized attributes before hashing. This is what prevents a hash commitment from being reversible by guessing or brute-forcing likely values.

**3. Commitment.** The salted attributes are hashed with SHA3-256. This one-way commitment is what actually gets signed and anchored — never the raw data itself.

**4. Issuer signature.** The issuer signs the commitment using a FIPS 204 ML-DSA-65 lattice-based signature, producing a credential cryptographically bound to that issuer and resistant to forgery, including by a future quantum adversary.

**5. Ledger anchoring.** The commitment, issuer ID, timestamp, and status are recorded in the permissioned Hyperledger Fabric chaincode record. The signature is not a field in that record; the API/credential flow handles signature verification separately.

**6. Verification.** A verifier receives the credential and the salt, recomputes the commitment locally, checks it against the ledger anchor, and verifies the issuer's signature — without ever needing access to a central database of raw identity data.

The SDK request sends the commitment rather than the raw claim, but this is not a guarantee that identity data exists in exactly one place: issuers may handle source attributes, and deployments must assess their own applications, logs, and storage. Downstream ledger state contains the commitment and lifecycle metadata, not the raw claim.
