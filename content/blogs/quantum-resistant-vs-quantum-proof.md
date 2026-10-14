---
title: "\"Quantum-Resistant\" Doesn't Mean \"Quantum-Proof\""
date: 2026-09-09
summary: "NIST's finalized post-quantum standards are the strongest cryptographic bet available, not a permanent guarantee against being broken."
order: 12
category: "Post-Quantum"
---
Somewhere between the NIST announcement and the marketing slide, "post-quantum" quietly turned into "unbreakable." It's an easy mistake to make. NIST spent eight years testing candidates, published three finalized standards, and the message that reached most engineering teams was: quantum computers solved, move on. That's not what actually happened.

What NIST finalized is three specific algorithms, each covering a specific job. FIPS 203 standardizes ML-KEM (built on the lattice problem behind CRYSTALS-Kyber) for key encapsulation — two parties agreeing on a shared secret over an untrusted channel. FIPS 204 standardizes ML-DSA (from CRYSTALS-Dilithium) for digital signatures. FIPS 205 gives you SLH-DSA, a hash-based signature scheme kept deliberately independent of lattice math, as a hedge in case lattice assumptions ever crack. None of these are "encryption" in the general sense people use the word — ML-KEM doesn't encrypt your files; it just gets two parties to a shared key so something else can.

That distinction matters more than it sounds. "Quantum-resistant" is a statement about resistance to attacks we currently know how to run — not a mathematical proof of permanent security, the way a one-time pad has actual information-theoretic guarantees. RSA and ECC looked unbreakable too, right up until Shor's algorithm gave quantum computers a shortcut through the exact math they relied on. Lattice problems are the field's best current bet precisely because nobody has found an equivalent shortcut yet — not because one is proven impossible.

There's a second layer of confusion worth naming: HQC was selected in 2025 as a second, independent post-quantum key-encapsulation method, precisely so the industry isn't betting everything on lattice hardness alone — but it's still working toward a final standard, not something you can claim compliance with today. Treating "selected" and "standardized" as the same word is how compliance checklists quietly become fiction.

None of this is an argument against migrating. It's an argument against migrating carelessly. The honest tradeoff is that post-quantum cryptography buys resistance against a specific, known class of future attack — it doesn't buy certainty. Good architecture treats ML-KEM and ML-DSA as the strongest tools available right now, keeps enough crypto-agility to swap algorithms again if lattice assumptions ever wobble, and never lets "post-quantum" become a synonym for "done."

The algorithms changed. The discipline of not trusting them completely didn't.
