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

Milestone 2 complete: double-click creation, dragging, resizing, selection/multi-selection, duplicate/delete, and arrow connections. Browser tests live in `tests/`; run `npx playwright test` with Chrome installed. Automatic fitting is deliberately avoided while adding nodes, so the canvas stays under the cursor.

Milestone 3 complete: editable node titles and Tiptap rich text with a contextual toolbar, headings/font sizes, emphasis, lists, inline code, alignment, and HTTP(S) links. Click Edit or double-click content to edit; drag the node header to move it. Formatting and canvas browser tests pass.

Milestone 4 complete: standard, process, decision, input/output, note, and code node styles; language-selectable highlighted code and clipboard copying; editable directional connection labels and solid/dashed lines. Code is edited as plain text and highlighted on finishing. Browser checks cover code highlighting/copy and edge styling.
