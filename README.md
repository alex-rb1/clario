# Clario

A minimal visual thinking and flow-mapping tool for developers. Map algorithms, systems, and ideas with connected rich-text and code nodes. No AI or accounts in v1.

## Development

Requires Node.js 22.12+.

```sh
npm install
npm run dev
npm run build
npm run lint
```

## Stack

React, TypeScript, Vite, React Flow, Tiptap, and Lowlight. Local browser persistence is planned for v1.

## Structure

- `src/App.tsx`: application routes and initial dashboard/canvas shell
- `src/App.css`: theme tokens and application styles
- `src/index.css`: global typography and reset

## Milestones

1. Foundation: dashboard, canvas route, responsive theme system.
2. Core canvas interactions.
3. Rich-text editing.
4. Code and connection styling.
5. Groups, shortcuts, and history.
6. Autosave and canvas management.
7. Templates.
8. Product quality and complete flow testing.

## Current limitations

Foundation only; editing and persistence arrive in subsequent milestones. Theme preference is saved locally. Fonts use Google Fonts with system fallbacks.
