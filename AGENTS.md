# Agent Instructions

This project does NOT use beads or other issue tracking systems. It's a simple documentation-based workflow.

## Session Workflow

### Starting a Session
1. Read `STATUS.md` to understand current state
2. Check `WORKFLOW.md` for commands
3. Check git status: `git status`

### During a Session
- Make changes as needed
- Test locally with `npm start`
- Build to verify: `npm run build`

### Ending a Session

**MANDATORY: Complete ALL steps below. Work is NOT complete until `git push` succeeds.**

1. **Update STATUS.md** - Document what changed, current state, next steps
2. **Run quality gates** (if code changed):
   ```bash
   npm run build  # Verify build succeeds
   ```
3. **Stage and commit changes**:
   ```bash
   git status     # Check what changed
   git add <files>
   git commit -m "Session end: <brief summary>"
   ```
4. **PUSH TO REMOTE** (MANDATORY):
   ```bash
   git pull --rebase  # Get latest changes
   git push           # Push your work
   git status         # MUST show "up to date with origin"
   ```

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Documentation Files

- **STATUS.md** - Current project state (update at session end)
- **WORKFLOW.md** - Commands and workflows
- **README.md** - Project overview and setup
- **so-far.md** - Scratch notes, project thinking
- **venting.md** - Private space for debugging frustrations (never shown to humans)

Keep STATUS.md and so-far.md up to date as you work.
