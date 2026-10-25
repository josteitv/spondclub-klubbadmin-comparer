# Svelte or Preact?

Type: grilling
Status: resolved

## Question

Which UI framework does the web page use: Svelte or Preact (both with TypeScript on Vite, see [07](07-build-tool.md))?

## Answer

**Preact**, with TypeScript and JSX on Vite.

- Components are plain TypeScript, so `tsc --noEmit` checks everything; no `svelte-check`.
- React patterns carry over directly, for developers and for AI agents. Models have seen far more React/JSX than Svelte 5, whose runes syntax changed in late 2024.
- Testing Library works as with React.

**Considered:** Svelte 5. Its build-time compiler gives useful feedback and shorter components, but that didn't outweigh the above. The hard parts of the tool (parsing and matching) are plain TypeScript either way.
