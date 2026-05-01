# Agent Instructions — Drux Health Store

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You are operating within the **Drux Health Store** project — a full-stack web platform with a marketplace, event management system, vendor portal, and admin panel.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

---

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs written in Markdown, live in `directives/`
- Define goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `execution/`
- Environment variables and API tokens stored in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work.

---

## Project Overview

**Drux Health Store** is a multi-module platform with:

| Module | Description |
|--------|-------------|
| **Marketplace** | Product listings, vendor shops, category filtering, cart & checkout |
| **Vendor Portal** | Vendor onboarding, product management, order tracking |
| **Events** | Event listings, registration with DOB, date/time display, coupon support |
| **Admin Panel** | Vendor management (approve/suspend/activate), category management, analytics |
| **Mobile UI** | Responsive mobile-first views for all major pages |

---

## Tech Stack

- **Frontend**: Next.js (React), Vanilla CSS / module CSS
- **Backend**: Node.js / Python (FastAPI or Django — check `.env` for active stack)
- **Database**: Check `.env` for DB connection string
- **Auth**: JWT-based (check backend for token handling)
- **Dev Server**: `npm run dev` (frontend), backend started separately

---

## Directory Structure

```
drux health store/
├── AGENTS.md               ← This file
├── directives/             ← SOPs (Markdown)
├── execution/              ← Python scripts (deterministic tools)
├── frontend-design/        ← Skill: premium UI generation
├── brand-guidelines/       ← Skill: design system
├── skill-creator/          ← Skill: creating new skills
├── .env                    ← API keys, DB strings, tokens
└── .tmp/                   ← Temp/intermediate files (never commit)
```

---

## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits — check with user first)
- Update the directive with what you learned (API limits, timing, edge cases)

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, or common errors — update the directive. Don't create or overwrite directives without asking unless explicitly told to.

**4. Never touch production data**
All data operations should run against dev/staging unless the user explicitly confirms production.

---

## Self-Annealing Loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test the tool, make sure it works
4. Update the directive to include the new flow
5. System is now stronger

---

## Key Conventions

- **Dates/Times**: Always parse event dates as UTC. Never apply local timezone offsets during parsing — use UTC-aware display formatting only at render time.
- **Mobile UI**: All new pages/components must be responsive. Test at 375px width minimum.
- **Vendor Status Flow**: `pending → approved → active | suspended`
- **Event Registration**: DOB is a mandatory field. Do not allow form submission without it.
- **Category Deduplication**: Always deduplicate category names (case-insensitive) before inserting to DB.

---

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.
