# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

**Serve locally:**
```bash
python -m http.server 8765
# then open http://localhost:8765/index.html
```

No build step, no dependencies, no package manager. The app is a single self-contained HTML file.

**Always deploy after making changes:**
```bash
cd "d:\VSCode\Claude Code\Pokemon App" && npx firebase deploy
```

## Architecture

Everything lives in `index.html` — HTML, CSS, and JS in one file. No frameworks.

### Data flow

1. **Init**: `fetchPokemon()`, `fetchTypeMap()`, and `fetchCostumeMap()` all fire in parallel at startup.
2. `fetchPokemon()` calls PokeAPI (`/pokemon?limit=1010`) → populates `state.all` → calls `applyFilter()` → `renderPicker()` → `loadFromURL()`.
3. `fetchTypeMap()` makes 18 parallel requests to `/type/{name}` → builds `typeMap: Map<id, [type1, type2?]>` → re-renders when done.
4. `fetchCostumeMap()` navigates the GitHub Git Trees API (master → Images/ → Pokemon/ → Addressable Assets/) to get all filenames → builds `costumeMap: Map<id, [{key, label, hasShiny}]>` → caches in `sessionStorage`.

### State

```js
state = {
  all: [],       // [{id, name}] — full PokeAPI list
  wanted: [],    // [{id, name, shiny, form}]
  trade: [],     // [{id, name, shiny, form}]
  filtered: [],  // current picker view after search/gen filter
  pendingId, pendingName, pendingForm,  // context menu staging
}
```

### Sprite sources (priority order)

1. **PokeMiners pogo_assets** — actual GO APK sprites: `pm{id}[.c{COSTUME}|.f{FORM}][.s].icon.png`
2. **PokeAPI HOME** — 3D renders fallback
3. **PokeAPI standard** — pixel sprites final fallback

### Sharing

Lists are shared via Firestore `sharedLinks` collection. Clicking "Copy Link" creates a doc and produces `?list={docId}`. Legacy `?view={userId}` links read from `sharedLists` collection.

Internally, lists are encoded as comma-separated strings: `1s,4bd-cFALL_2018`
- `{id}` = normal form, not shiny
- `{id}s` = shiny, `{id}b` = has background, `{id}d` = dynamax
- `{id}-{formSuffix}` = costume/form (strips leading dot from form key, uses `-` separator)

### Card backgrounds

`cardBg(id)` returns a CSS `background` value:
- Single-type → solid pastel (type color blended 28% with white via `lightenHex`)
- Dual-type → `linear-gradient(135deg, color1, color2)`

### Form/costume keys

PokeMiners naming: `.cFALL_2018`, `.fALOLA`, `.cGOFEST_2021_NOEVOLVE`, etc.
- `.c` prefix = costume
- `.f` prefix = regional/alternate form
- `_NOEVOLVE` suffix is stripped from display labels

## External APIs

- `https://pokeapi.co/api/v2/` — Pokemon list and type data
- `https://api.github.com/repos/PokeMiners/pogo_assets/git/trees/` — costume file listing
- `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/` — sprite images

## Git remote

`https://github.com/ArkahnCode/CC-Pogo-App.git` (push requires PAT token in URL or credential manager)
