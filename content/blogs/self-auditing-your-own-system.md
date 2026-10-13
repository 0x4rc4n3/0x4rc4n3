---
title: "I Built a Post-Quantum Identity System. Then I Tried to Break It Myself."
date: 2026-08-25
summary: "Cryptographic soundness and system security are not the same thing. How a structured self-audit surfaced real-world implementation flaws."
order: 7
category: "Security"
---
It's tempting to treat "cryptographically secure" as the finish line. ML-DSA-65 signatures are sound. The commitment scheme is sound. Ship it.

That's also exactly how real systems get breached — not because the cryptography was broken, but because something around it wasn't. Misconfigured access controls, disabled checks left over from development, an endpoint nobody remembered to lock down. The math being correct says nothing about whether the implementation surrounding it is.

So after ScatterID's core functionality was working, I ran a structured audit against my own system, treating it the way an attacker would rather than the way its author would.

I found two real problems. An administrative interface that had no authentication requirement at all — functional, reachable, and completely open, the kind of thing that's invisible in a code review focused on the cryptographic logic but immediately obvious to anyone actually poking at the running system. And a disabled TLS certificate check, almost certainly left over from local development, that would have silently accepted invalid certificates in a live deployment.

Both got fixed. But fixing them wasn't the part I actually cared about — anyone can patch a known issue. What mattered was re-verifying each fix by running the live system again afterward, not just reading the diff and assuming it worked. Code review confirms intent. Running the system confirms behavior. Those aren't the same thing, and treating them as interchangeable is how "fixed" bugs come back.

The lesson that stuck: cryptographic soundness and system security are related, but they're not the same claim. A system can get the hard math completely right and still be trivially breakable through something the math was never meant to protect.
