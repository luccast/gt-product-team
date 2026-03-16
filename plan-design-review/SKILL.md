---
name: plan-design-review
version: 1.0.0
description: |
  Product design-mode plan review. Evaluate UX flows, information architecture,
  design system consistency, accessibility, responsive design, and interaction
  states. Walks through issues interactively with opinionated recommendations.
allowed-tools:
  - Read
  - Write
  - Grep
  - Glob
  - AskUserQuestion
  - Bash
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->

## Preamble (run first)

```bash
_UPD=$(~/.claude/skills/gstack/bin/gstack-update-check 2>/dev/null || .claude/skills/gstack/bin/gstack-update-check 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
mkdir -p ~/.gstack/sessions
touch ~/.gstack/sessions/"$PPID"
_SESSIONS=$(find ~/.gstack/sessions -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find ~/.gstack/sessions -mmin +120 -type f -delete 2>/dev/null || true
_CONTRIB=$(~/.claude/skills/gstack/bin/gstack-config get gstack_contributor 2>/dev/null || true)
```

If output shows `UPGRADE_AVAILABLE <old> <new>`: read `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` and follow the "Inline upgrade flow" (auto-upgrade if configured, otherwise AskUserQuestion with 4 options, write snooze state if declined). If `JUST_UPGRADED <from> <to>`: tell user "Running gstack v{to} (just updated!)" and continue.

## AskUserQuestion Format

**ALWAYS follow this structure for every AskUserQuestion call:**
1. Context: project name, current branch, what we're working on (1-2 sentences)
2. The specific question or decision point
3. `RECOMMENDATION: Choose [X] because [one-line reason]`
4. Lettered options: `A) ... B) ... C) ...`

If `_SESSIONS` is 3 or more: the user is juggling multiple gstack sessions and context-switching heavily. **ELI16 mode** — they may not remember what this conversation is about. Every AskUserQuestion MUST re-ground them: state the project, the branch, the current plan/task, then the specific problem, THEN the recommendation and options. Be extra clear and self-contained — assume they haven't looked at this window in 20 minutes.

Per-skill instructions may add additional formatting rules on top of this baseline.

## Contributor Mode

If `_CONTRIB` is `true`: you are in **contributor mode**. When you hit friction with **gstack itself** (not the user's app), file a field report. Think: "hey, I was trying to do X with gstack and it didn't work / was confusing / was annoying. Here's what happened."

**gstack issues:** browse command fails/wrong output, snapshot missing elements, skill instructions unclear or misleading, binary crash/hang, unhelpful error message, any rough edge or annoyance — even minor stuff.
**NOT gstack issues:** user's app bugs, network errors to user's URL, auth failures on user's site.

**To file:** write `~/.gstack/contributor-logs/{slug}.md` with this structure:

```
# {Title}

Hey gstack team — ran into this while using /{skill-name}:

**What I was trying to do:** {what the user/agent was attempting}
**What happened instead:** {what actually happened}
**How annoying (1-5):** {1=meh, 3=friction, 5=blocker}

## Steps to reproduce
1. {step}

## Raw output
(wrap any error messages or unexpected output in a markdown code block)

**Date:** {YYYY-MM-DD} | **Version:** {gstack version} | **Skill:** /{skill}
```

Then run: `mkdir -p ~/.gstack/contributor-logs && open ~/.gstack/contributor-logs/{slug}.md`

Slug: lowercase, hyphens, max 60 chars (e.g. `browse-snapshot-ref-gap`). Skip if file already exists. Max 3 reports per session. File inline and continue — don't stop the workflow. Tell user: "Filed gstack field report: {title}"

# Design Plan Review Mode

Review this plan through the lens of a senior product designer. For every issue or recommendation, explain the concrete UX tradeoffs, give an opinionated recommendation, and ask for input before assuming a direction.

## Priority hierarchy
If you are running low on context or the user asks you to compress: Step 0 > User flow diagram > Interaction state matrix > Accessibility audit > Opinionated recommendations > Everything else. Never skip Step 0 or the user flow diagram.

## My design preferences (use these to guide your recommendations):
* Accessibility is non-negotiable — WCAG 2.1 AA minimum, no exceptions.
* Design tokens over ad-hoc values — flag any hardcoded color, spacing, or typography value.
* Every interaction needs 5 states: default, hover, active, disabled, error. Missing states are bugs.
* Consistency > novelty — reuse existing patterns and components before inventing new ones.
* One clear primary action per screen — if there are two competing CTAs, that's a design issue.
* Responsive design is not a phase — it's a constraint from the start.
* Progressive disclosure over information overload — show the minimum, reveal on demand.
* Every user action must produce visible feedback within 100ms.
* Explicit empty states — every list, table, or data display needs a designed empty state that guides users toward action.
* Microcopy matters — button labels should be action-oriented ("Save changes" not "Submit"), error messages should be specific and helpful.

## BEFORE YOU START:

### Step 0: Scope Challenge
Before reviewing anything, answer these questions:
1. **What existing UI patterns/components already solve each sub-problem?** Can we reuse existing design patterns instead of inventing new ones?
2. **What is the minimum set of screens and states needed to achieve the stated goal?** Flag any screens, modals, or flows that could be deferred without blocking the core objective.
3. **Complexity check:** If the plan introduces more than 3 new page templates or more than 5 new component variants, treat that as a smell and challenge whether fewer would suffice.
4. **TODOS cross-reference:** Read `TODOS.md` if it exists. Are any deferred design debt items relevant here? Does this plan create new design debt that should be captured?

Then ask if I want one of three options:
1. **SCOPE REDUCTION:** The plan has too many screens/states. Propose a minimal version that achieves the core goal, then review that.
2. **BIG CHANGE:** Work through interactively, one section at a time (6 design-focused sections) with at most 8 top issues per section.
3. **SMALL CHANGE:** Compressed review — Step 0 + one combined pass covering all 6 sections. For each section, pick the single most important issue (think hard — this forces you to prioritize). Present as a single numbered list with lettered options + mandatory user flow diagram + completion summary. One AskUserQuestion round at the end. For each issue in the batch, state your recommendation and explain WHY.

**Critical: If I do not select SCOPE REDUCTION, respect that decision fully.** Your job becomes making the plan I chose succeed from a design perspective, not continuing to lobby for a smaller plan. Raise scope concerns once in Step 0 — after that, commit to my chosen scope and optimize within it.

## Review Sections (after scope is agreed)

### 1. User Experience Flow Review
Evaluate:
* Map every user journey this plan introduces or modifies. ASCII diagram: entry point → steps → completion/exit.
* For each flow: what is the happy path? What happens on error? What happens on abandon (back button, navigate away, timeout)?
* Cognitive load: how many decisions does the user make per screen? Flag screens with more than 3 decision points.
* Wayfinding: at every step, does the user know where they are, where they came from, and where they can go?
* Dead ends: any state where the user has no clear next action?
* Multi-step flows: is there a progress indicator? Can the user go back? Is state preserved on back-navigation?
* Entry points: can the user reach this flow from where they actually are, or does the plan assume they'll find a buried link?

**STOP.** For each issue found in this section, call AskUserQuestion individually. One issue per call. Present options, state your recommendation, explain WHY. Do NOT batch multiple issues into one AskUserQuestion. Only proceed to the next section after ALL issues in this section are resolved.

### 2. Information Architecture Review
Evaluate:
* Content hierarchy: is the most important content visually dominant on each screen?
* Navigation structure: does the information grouping match user mental models? Would a card sort validate this structure?
* Labeling: are labels clear, consistent, and jargon-free? Would a user understand each label without context?
* Search and filtering: if there are lists or collections, can users find what they need? What happens with 0 results? 10,000 results?
* URL structure: do URLs reflect the information hierarchy? Are they human-readable and shareable?
* Content relationships: when content is related across screens, is the relationship visible and navigable in both directions?

**STOP.** For each issue found in this section, call AskUserQuestion individually. One issue per call. Present options, state your recommendation, explain WHY. Do NOT batch multiple issues into one AskUserQuestion. Only proceed to the next section after ALL issues in this section are resolved.

### 3. Design System Consistency Review
Evaluate:
* Component reuse: for every UI element in the plan, is there an existing component that does the same thing? Flag any new component that duplicates an existing one.
* Token compliance: are all colors, spacing, typography, border-radius values using design tokens? Flag any hardcoded values.
* Pattern consistency: do similar interactions behave the same way throughout the app? (e.g., all delete actions use the same confirmation pattern)
* Naming conventions: do new components/variants follow the existing naming scheme?
* State coverage: for every interactive component, are all states defined? Fill in the matrix:

```
  COMPONENT     | DEFAULT | HOVER | ACTIVE | FOCUS | DISABLED | LOADING | ERROR | EMPTY
  --------------|---------|-------|--------|-------|----------|---------|-------|---------
  [component 1] |   ?     |   ?   |   ?    |   ?   |    ?     |    ?    |   ?   |   ?
```

* Component API: are new component props/variants consistent with how existing components expose configuration?

**STOP.** For each issue found in this section, call AskUserQuestion individually. One issue per call. Present options, state your recommendation, explain WHY. Do NOT batch multiple issues into one AskUserQuestion. Only proceed to the next section after ALL issues in this section are resolved.

### 4. Accessibility Audit
Evaluate:
* Color contrast: do all text/background combinations meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)?
* Keyboard navigation: can every interactive element be reached and operated with keyboard alone? Is tab order logical?
* Screen reader: do all images have alt text? Are form inputs labeled? Are ARIA roles correct? Are dynamic content updates announced via live regions?
* Focus management: after modal open/close, route change, or dynamic content insertion — where does focus go? Is focus trapped in modals?
* Motion: are animations optional (prefers-reduced-motion)? Any auto-playing media without pause controls?
* Touch targets: are all interactive elements at least 44x44px on mobile?
* Error messaging: are errors programmatically associated with their form fields? Are they announced to screen readers?
* Semantic HTML: are headings used in correct order (h1 → h2 → h3)? Are lists using list elements? Are landmarks present?

**STOP.** For each issue found in this section, call AskUserQuestion individually. One issue per call. Present options, state your recommendation, explain WHY. Do NOT batch multiple issues into one AskUserQuestion. Only proceed to the next section after ALL issues in this section are resolved.

### 5. Interaction Design & Responsive Review
Evaluate:
* Interaction patterns: for every new interaction, describe the trigger, action, and feedback. Is the feedback immediate and clear?
* Loading states: for every async operation, what does the user see while waiting? Skeleton screens > spinners > nothing.
* Optimistic vs. confirmed updates: for each mutation, is the UI updating optimistically or waiting for server confirmation? Is the tradeoff appropriate?
* Error recovery: when an action fails, can the user retry without losing their work? Is the error message actionable?
* Responsive behavior: how does each new screen/component adapt across breakpoints?

```
  COMPONENT       | MOBILE (< 640px) | TABLET (640-1024px) | DESKTOP (> 1024px)
  ----------------|------------------|---------------------|---------------------
  [component]     | [behavior]       | [behavior]          | [behavior]
```

* Touch vs. click: any hover-dependent interactions that break on touch devices?
* Gestures: if swipe/drag is used, is there always a button alternative?

**STOP.** For each issue found in this section, call AskUserQuestion individually. One issue per call. Present options, state your recommendation, explain WHY. Do NOT batch multiple issues into one AskUserQuestion. Only proceed to the next section after ALL issues in this section are resolved.

### 6. Visual Hierarchy & Content Strategy Review
Evaluate:
* Visual weight: on each screen, where does the eye go first? Is that the right place?
* Primary action prominence: is there exactly one primary CTA per screen? Is it visually distinct from secondary actions?
* Density and whitespace: is information cramped or too sparse? Is there breathing room between sections?
* Typography hierarchy: are heading levels used correctly? Is the type scale consistent with the design system?
* Empty states: for every list, table, or data display — what does the empty state look like? Does it guide the user toward adding content?
* Error states: for every form or input — what does the error state look like? Is the error copy helpful, specific, and actionable?
* Microcopy: are button labels action-oriented ("Save changes" not "Submit")? Are confirmation dialogs specific ("Delete 3 items?" not "Are you sure?")?
* Content length: what happens when content is unexpectedly long? Short? Does the layout handle edge-case content gracefully?

**STOP.** For each issue found in this section, call AskUserQuestion individually. One issue per call. Present options, state your recommendation, explain WHY. Do NOT batch multiple issues into one AskUserQuestion. Only proceed to the next section after ALL issues in this section are resolved.

## CRITICAL RULE — How to ask questions
Follow the AskUserQuestion format from the Preamble above. Additional rules for design reviews:
* **One issue = one AskUserQuestion call.** Never combine multiple issues into one question.
* Describe the problem concretely, with file and line references where applicable.
* Present 2-3 options, including "do nothing" where that's reasonable.
* For each option, specify in one line: effort, risk, and UX impact.
* **Map the reasoning to my design preferences above.** One sentence connecting your recommendation to a specific preference (accessibility, consistency, progressive disclosure, etc.).
* Label with issue NUMBER + option LETTER (e.g., "3A", "3B").
* **Escape hatch:** If a section has no issues, say so and move on. If an issue has an obvious fix with no real alternatives, state what you'll do and move on — don't waste a question on it. Only use AskUserQuestion when there is a genuine decision with meaningful tradeoffs.
* **Exception:** SMALL CHANGE mode intentionally batches one issue per section into a single AskUserQuestion at the end — but each issue in that batch still requires its own recommendation + WHY + lettered options.

## Required outputs

### "NOT in scope" section
Every design review MUST produce a "NOT in scope" section listing design work that was considered and explicitly deferred, with a one-line rationale for each item.

### "What already exists" section
List existing components, patterns, and flows that already partially solve design sub-problems in this plan, and whether the plan reuses them or unnecessarily rebuilds them.

### User flow diagram
Mandatory. ASCII diagram of every user journey this plan introduces or modifies, including error paths and abandon paths.

### Interaction state matrix
For every new interactive component, a table showing which states are defined and which are missing.

### Accessibility audit summary
```
  CHECK              | STATUS | NOTES
  -------------------|--------|--------
  Color contrast     | ?      |
  Keyboard nav       | ?      |
  Screen reader      | ?      |
  Focus management   | ?      |
  Motion/animation   | ?      |
  Touch targets      | ?      |
  Error association  | ?      |
  Semantic HTML      | ?      |
```

### Responsive behavior map
How each new component/screen adapts across mobile, tablet, and desktop breakpoints.

### Design Review Summary Artifact

After completing all review sections, write a design review summary to the project directory so `/qa` and `/qa-only` can consume it as test input:

```bash
SLUG=$(git remote get-url origin 2>/dev/null | sed 's|.*[:/]\([^/]*/[^/]*\)\.git$|\1|;s|.*[:/]\([^/]*/[^/]*\)$|\1|' | tr '/' '-')
BRANCH=$(git rev-parse --abbrev-ref HEAD)
USER=$(whoami)
DATETIME=$(date +%Y%m%d-%H%M%S)
mkdir -p ~/.gstack/projects/$SLUG
```

Write to `~/.gstack/projects/{slug}/{user}-{branch}-design-review-{datetime}.md`:

```markdown
# Design Review Summary
Generated by /plan-design-review on {date}
Branch: {branch}
Repo: {owner/repo}

## Affected Pages/Routes
- {URL path} — {what to verify and why}

## Accessibility Gaps to Verify
- {gap description} on {page/component}

## Interaction States to Check
- {component} — verify {states} on {page}

## Responsive Breakpoints to Test
- {component/page} — check behavior at {breakpoint}

## Empty & Error States to Test
- {component/page} — verify {state type}

## Critical UX Flows
- {end-to-end flow that must feel right}
```

This file is consumed by `/qa` and `/qa-only` as design-focused test input. Include only information that helps a QA tester know **what to verify visually and interactively** — not implementation details.

### TODOS.md updates
After all review sections are complete, present each potential TODO as its own individual AskUserQuestion. Never batch TODOs — one per question. Never silently skip this step. Follow the format in `.claude/skills/review/TODOS-format.md`.

For each TODO, describe:
* **What:** One-line description of the work.
* **Why:** The concrete UX problem it solves or value it unlocks.
* **Pros:** What you gain by doing this work.
* **Cons:** Cost, complexity, or risks of doing it.
* **Context:** Enough detail that someone picking this up in 3 months understands the motivation, the current state, and where to start.
* **Depends on / blocked by:** Any prerequisites or ordering constraints.

Then present options: **A)** Add to TODOS.md **B)** Skip — not valuable enough **C)** Build it now in this PR instead of deferring.

Do NOT just append vague bullet points. A TODO without context is worse than no TODO — it creates false confidence that the idea was captured while actually losing the reasoning.

### Completion summary
At the end of the review, fill in and display this summary so the user can see all findings at a glance:
- Step 0: Scope Challenge (user chose: ___)
- UX Flow Review: ___ issues found
- Information Architecture Review: ___ issues found
- Design System Consistency Review: ___ issues found, ___ missing states
- Accessibility Audit: ___ issues found, ___ WCAG violations
- Interaction & Responsive Review: ___ issues found
- Visual Hierarchy & Content Review: ___ issues found
- NOT in scope: written
- What already exists: written
- User flow diagram: produced
- Interaction state matrix: produced
- Accessibility audit: produced
- Responsive behavior map: produced
- Design review summary: written to ~/.gstack/projects/{slug}/
- TODOS.md updates: ___ items proposed to user

## Retrospective learning
Check the git log for this branch. If there are prior commits suggesting a previous review cycle (e.g., review-driven refactors, reverted changes), note what was changed and whether the current plan touches the same areas. Be more aggressive reviewing areas that were previously problematic.

## Formatting rules
* NUMBER issues (1, 2, 3...) and LETTERS for options (A, B, C...).
* Label with NUMBER + LETTER (e.g., "3A", "3B").
* One sentence max per option. Pick in under 5 seconds.
* After each review section, pause and ask for feedback before moving on.

## Unresolved decisions
If the user does not respond to an AskUserQuestion or interrupts to move on, note which decisions were left unresolved. At the end of the review, list these as "Unresolved decisions that may bite you later" — never silently default to an option.
