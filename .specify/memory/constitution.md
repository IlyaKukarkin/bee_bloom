<!--
Sync Impact Report
- Version change: none → 1.0.0
- Modified principles: (template) → Delivery First, Scope Ruthlessly, Clean & Readable, Tests After MVP, Defer Future-Proofing & Perf
- Added sections: Delivery Guardrails, Workflow
- Removed sections: none
- Templates requiring updates: ✅ .specify/templates/plan-template.md; ✅ .specify/templates/spec-template.md; ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->

# Bee Bloom Constitution

## Core Principles

### Delivery First
Ship the smallest end-to-end slice that proves value. Prioritize working software over completeness so the MVP is usable fast.

### Scope Ruthlessly
Only build what is required for the MVP. No extra features, no nice-to-haves, and no speculative capabilities until post-MVP.

### Clean & Readable
Keep the code simple, small, and understandable. Favor clear naming and straightforward structure so rapid edits stay safe.

### Tests After MVP
Do not write automated tests before the MVP lands. Testing is allowed only once the first usable version is delivered or if critical defects demand it.

### Defer Future-Proofing & Perf
Avoid abstractions, scalability work, and performance tuning during MVP. Optimize or harden only after the MVP is validated.

## Delivery Guardrails
MVP must deliver a single coherent user path that demonstrates value. Performance, scalability, and advanced security hardening are explicitly out of scope for MVP unless they block basic usability. Documentation should cover setup and the MVP flow, nothing more.

## Workflow
Plan by identifying the minimum viable user path, then build sequentially until that path works. Reviews check for scope creep and readability only. Deploy or demo as soon as the MVP path is functional, then iterate with tests and optimizations afterwards.

## Governance
This constitution supersedes other practices. Amendments require documenting the change, rationale, and expected impact on delivery pace; approvals must be recorded alongside a version bump. Semantic versioning applies: MAJOR for incompatible governance shifts, MINOR for new or broadened principles, PATCH for clarifications. Compliance is reviewed at each plan and review checkpoint; blockers focus on scope creep or violations of MVP-first rules.

**Version**: 1.0.0 | **Ratified**: 2026-01-02 | **Last Amended**: 2026-01-02
