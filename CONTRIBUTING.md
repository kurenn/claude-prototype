# Contributing to claude-prototype

Thanks for considering a contribution. This skill is small and opinionated — PRs that simplify, tighten, or add graceful-degradation paths are especially welcome.

## What's in scope

- **Template improvements** — cleaner scaffold HTML/CSS/JS; better defaults.
- **Better detection of optional skills** — more reliable checks for impeccable, prompt-refiner, claude-in-chrome presence.
- **More built-in lint rules** — extending `checks/builtin-lint.md` with checks that don't require impeccable.
- **Feedback overlay polish** — keyboard shortcuts, better pin positioning, better selector heuristics.
- **Example prototypes** — dropping a reference prototype under `examples/` that demonstrates the skill's output.
- **Docs** — the `SKILL.md` is the contract with Claude; clarifying it helps everyone.

## What's out of scope

- **Build tooling.** No webpack, vite, or npm scripts in the scaffold output. This is load-bearing. Prototypes run with one command.
- **Framework bindings.** No React, Vue, Svelte templates. Vanilla HTML + Tailwind CDN + vanilla JS only.
- **Backend logic.** Prototypes are static. If your PR needs a server, it belongs in a different skill.
- **Tracking / telemetry.** Nothing in this skill should phone home.

## Development setup

```
git clone https://github.com/kurenn/claude-prototype ~/.claude/skills/prototype
# or if you plan to contribute, fork first and clone your fork:
# git clone git@github.com:<your-username>/claude-prototype.git ~/code/claude-prototype
# edit files in ~/.claude/skills/prototype
# in a separate Claude Code session, run /prototype to test changes
```

Because the skill is loaded by Claude from `~/.claude/skills/`, edits take effect in the next `/prototype` invocation. No rebuild.

## Testing a scaffold change

1. Make your edit in `templates/scaffold-base/` or `templates/feedback-overlay/`.
2. In Claude Code, run `/prototype` and build a test prototype.
3. `cd` into the generated folder and run `python3 -m http.server 8000`.
4. Verify the change. Flip every theme. Try `?feedback=1`. Try the share button.
5. Check mobile width (375px in devtools).

## Testing a `SKILL.md` change

The SKILL.md is what Claude reads. When you change it:

1. Edit the file.
2. In a fresh Claude Code session, run `/prototype` with the same inputs.
3. Compare: did the behavior change as expected?
4. Check graceful degradation: disable optional skills and re-run. Make sure nothing fails.

## PR checklist

- [ ] Changes preserve zero-dep scaffold output (no `package.json` in the generated prototype).
- [ ] If you added a check in `builtin-lint.md`, it's verifiable with `grep` or visual inspection — no external tools.
- [ ] If you changed the scaffold, all three themes still render correctly.
- [ ] If you touched `feedback.js`, the exported JSON still includes `shareable_url`, `selector`, `viewport.theme`, and `type`.
- [ ] README and SKILL.md are in sync.

## Philosophy

This skill exists because good prototypes are *fast* and *believable*. Every feature has to pass both bars:

- **Fast** — does it slow down the build loop? If yes, simplify or cut.
- **Believable** — does it make the prototype feel more like a real product to a skeptical viewer? If yes, keep.

When in doubt, ship less.
