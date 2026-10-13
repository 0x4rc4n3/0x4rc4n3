---
title: "What \"Source-Available\" Actually Means (and Why ScatterID Isn't \"Open Source\")"
date: 2026-08-13
summary: "ScatterID is licensed under PolyForm Noncommercial 1.0.0. Why transparency and honest project maturity matter more than unrestricted commercial redistribution."
order: 3
category: "Open Source"
---
image: /uploads/blog-opensource.svg
imageAlt: Source-available software & transparent engineering editorial illustration
"Open source" gets used loosely, but it has a specific meaning: a license approved by the Open Source Initiative, which — among other things — must permit unrestricted commercial use. ScatterID doesn't meet that bar, and I chose that deliberately.

ScatterID is licensed under PolyForm Noncommercial 1.0.0. That license lets anyone view the code, fork it, modify it, and use it freely for personal, academic, and research purposes. What it doesn't permit is using it, or anything derived from it, for commercial purposes without a separate agreement.

Why not just use MIT or Apache and call it a day? Two honest reasons.

First, ScatterID is a student capstone project, not production infrastructure. It hasn't gone through the kind of external security review or hardening that identity systems handling real personal data need before they should be trusted commercially. Releasing it under a fully permissive license would implicitly invite commercial use I'm not confident it's ready for yet.

Second, source-available still delivers most of what actually matters for a project like this: transparency. Anyone — a researcher, a student, a hiring manager, a security reviewer — can read every line, review the self-audit history, and verify the claims I'm making about how the system works. That's the property I actually care about. Unrestricted commercial redistribution isn't.

If that changes — if ScatterID matures to a point where I'm confident recommending it for production use — the license can change too. Source-available now doesn't mean closed later; it means honest about where the project actually stands.
