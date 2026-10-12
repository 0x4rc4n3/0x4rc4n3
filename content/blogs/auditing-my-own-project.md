---
title: What I found auditing my own project
date: 2026-09-01
summary: Two real flaws I found and fixed in ScatterID.
---
After finishing ScatterID, I ran a self-directed security audit on it.

## What I found
- An **unauthenticated admin interface**.
- A **disabled TLS certificate check**.

## What I did
I fixed both and re-verified each fix by running the system. The audit history is public on GitHub.

This is a starter post. Rewrite it in your own words from the CMS.
