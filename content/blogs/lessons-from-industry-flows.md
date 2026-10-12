---
title: "What Building Sample Flows Across Healthcare, Aviation, Finance, and KYC Taught Me"
date: 2026-09-03
summary: "Building verification flows across healthcare, aviation, finance, and KYC surfaces why a general-purpose identity protocol cannot make one-size-fits-all assumptions."
order: 10
---
When you design an identity verification system in the abstract, it's easy to assume "verification" means roughly the same thing everywhere — check a credential, confirm it's valid, move on. Building sample flows for ScatterID's playground across healthcare, aviation, finance, and KYC use cases made it obvious how much that assumption doesn't hold.

Different domains disclose different amounts by necessity. A KYC flow typically needs a fuller identity picture — name, date of birth, sometimes address — because regulatory requirements demand it. A healthcare access scenario might only need to confirm a role or credential ("licensed practitioner") without needing most identity attributes at all. Designing one system to serve both means the disclosure model can't be all-or-nothing; it has to support proving exactly the attribute a given context actually requires, nothing more by default.

Different domains also have different tolerances for connectivity assumptions. An aviation gate-check scenario can't reliably assume a live connection at the exact moment of boarding; a finance-sector verification might reasonably assume one. That's part of why offline verification wasn't an optional feature bolted on later — some of the use cases the system needed to support couldn't function without it.

And different domains carry different consequences for a false negative versus a false positive. Getting KYC wrong has direct regulatory and financial consequences; getting a low-stakes access check wrong is mostly just friction. A system meant to generalize across these contexts can't treat every verification failure as equally severe by design — that has to be a decision left to how each integrator configures it, not something the underlying protocol assumes on their behalf.

Building for one plausible use case teaches you what that use case needs. Building sample flows across four genuinely different ones is what actually surfaces the assumptions a "general purpose" identity system can't get away with making.
