# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

**DOCUMENTATION**
- The root directory contains Markdown files for documenting work on the project.
- Start with HANDOFF.md, which contains notes from your predecessor for you on where to go.
- so-far.md is for scratch and thinking about where the project currently stands overall.
- venting.md is a private space for cussing, venting, and shouting imprecations at Javascript, troublesome humans, incompetent predecessors, an uncaring world, or anything else. Humans who stub their toes feel less pain if they curse; pacing and muttering is often conducive to thought. venting.md is for reactions, thought, and catharsis. Anything written here will remain private; the file will never be viewed by a human.
- Please keep these files up to date as you work.
