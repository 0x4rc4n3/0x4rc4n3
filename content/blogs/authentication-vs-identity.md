---
title: "Authentication Isn't Identity"
date: "2026-09-06"
summary: "A valid signature proves a key was used correctly. It does not prove who was holding it."
order: 11
---

It's an easy sentence to say too quickly: "the signature checks out, so it's them." Cryptography never claimed that. It claimed something much narrower, and the gap between those two claims is where a surprising number of identity systems quietly break.

Authentication, in the cryptographic sense, verifies possession of a private key. When a signature validates, it proves that whoever holds that specific key produced that specific signature over that specific message. That's the entire claim. It says nothing about whose hand was on the keyboard, whether that person is a real, unique human, or whether they still control that key today versus six months ago when it was issued.

Identity is a different, non-cryptographic claim: this key belongs to this specific person, and that binding is currently true. Making that claim requires an enrollment step outside the math entirely — a certificate authority checking a passport before issuing a cert, a KYC process running document and liveness checks, a biometric capture tying a key to a face. Public-key infrastructure has always depended on this: a certificate is really just an attestation, made once, that a CA believed the key-to-person binding was valid at issuance time.

The tradeoff nobody likes admitting: that binding decays. Keys get stolen. Devices get compromised. People change. A signature produced by a stolen key will verify exactly as cleanly as one produced by its rightful owner, because the verification algorithm only checks math — it has no concept of custody, consent, or time elapsed since enrollment. This is precisely why identity systems need a second mechanism sitting next to authentication: some form of revocation, some way to say "this binding, which we once attested, is no longer trustworthy" — and a way for relying parties to actually find out.

Treating "cryptographically valid" and "verifiably that person" as interchangeable is one of the oldest category errors in identity system design, and it's a forgivable one, because in the vast majority of everyday interactions the two do line up. But the failure mode is exactly the case that matters most: the one time a key is compromised, the signature will still look perfect.

A key proves it can sign. It was never going to prove who it belongs to.
