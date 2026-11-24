# Skills installeren

Voor de skills in `CLAUDE.md`. Eenmalig per laptop. `/plugin`-commando's typ je in Claude Code, `npx`-commando's in een terminal (`-g` = voor al je projecten). Herstart Claude Code na installeren.

## Plugins (Claude Code)

```
/plugin install superpowers@claude-plugins-official
/plugin install figma@claude-plugins-official
```

`claude-plugins-official` is standaard beschikbaar. Na het installeren van `figma`: open `/plugin`, kies Figma en log in via de browser.

```
/plugin marketplace add anthropics/knowledge-work-plugins
/plugin install design@knowledge-work-plugins

/plugin marketplace add JuliusBrussee/caveman
/plugin install caveman@caveman

/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail

/plugin install frontend-design@claude-plugins-official
/plugin install cowork-plugin-management@knowledge-work-plugins

/plugin marketplace add latent-spaces/brag
/plugin install brag@brag

/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

/plugin marketplace add instruktlabs/kiln
/plugin install kiln-engine@instruktlabs

/plugin install vibe-wise@anthropic-plugin-directory
```

## Losse skills

```bash
npx skills add pbakaus/impeccable -g
npx skills add jakubkrehel/make-interfaces-feel-better -g
npx skills add addyosmani/agent-skills --skill incremental-implementation -g
npx skills add mattpocock/skills --skill handoff -g
npx skills add addyosmani/agent-skills --skill security-and-hardening -g
npx skills add shadcn/ui -g
npx skills add woerndl/unsloppify -g

# Emil Kowalski: animatie en interface (apple-design, break-ui, animate, choreograph, gestures, ...)
npx skills add emilkowalski/skills -g

# Matt Pocock: engineering (zonder code-review en prototype: die botsen met /code-review en met prototype van Emil)
npx skills add mattpocock/skills -g --skill ask-matt codebase-design diagnosing-bugs domain-modeling grill-with-docs implement implement-spec improve-codebase-architecture pr research retro setup-matt-pocock-skills tdd to-spec to-tickets triage wayfinder wizard

npx skills add Leonxlnx/taste-skill -g
npx skills add blader/humanizer -g
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -g
npx skills add microsoft/playwright-cli --skill playwright-cli -g
```

Bron nog niet gevonden: `graphify`, `image-to-code`, `gdpr-compliance` en de Roblox-skills (`create-roblox-game`, `roblox-*`).

## Ingebouwd (niks installeren)

`/code-review`, `/security-review`, `/init`

## Controleren

Typ `/` in Claude Code. De skills uit de tabel in `CLAUDE.md` moeten in de lijst staan.
