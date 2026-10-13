---
title: "QuantX"
type: DESIGN STAGE
order: 3
image: /uploads/quantx-card.svg
stack: Python, cryptography, liboqs
duration: Architecture and specification
impact: Algorithm agility designed into the API; no hand-rolled primitives.
link: https://github.com/0x4rc4n3/QuantX
imageAlt: QuantX project card
summary: A crypto-agile hybrid authentication SDK design where swapping algorithms is a constructor choice, not a rewrite.
---
## The idea
QuantX is an architecture and specification for a hybrid classical and post-quantum authentication engine. Its central design goal is crypto-agility: algorithm selection should be explicit and replaceable without rewriting the calling application.
## Design principles
- Compose established libraries such as `cryptography` and `liboqs`; do not hand-roll cryptographic primitives.
- Keep algorithm configuration at the API boundary.
- Treat this repository as a design-stage project, not a completed production SDK.

[View the source repository](https://github.com/0x4rc4n3/QuantX).
