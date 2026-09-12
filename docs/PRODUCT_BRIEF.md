# Clario

Build **Clario**, a visual thinking and flow-mapping application designed specifically for developers.

## Product Vision

Developers often need to reason about algorithms, system architecture, user flows, project structure, debugging flows, and technical concepts. Text alone can make relationships and execution flow difficult to visualize.

Clario should provide a fast, minimal visual canvas where developers can structure their thinking using connected nodes containing text, rich formatting, and code.

The experience should feel more like a lightweight developer tool than a traditional diagramming application.

The core workflow is:

**Create canvas → add nodes → write ideas/code → connect nodes → organize visually → Clario autosaves the work.**

AI features may be added in a future version, but **Clario v1 should not contain AI functionality.**

---

# V1 Requirements

## Canvas

Create an infinite-style visual canvas that supports:

* Panning
* Zooming
* Creating nodes
* Dragging/repositioning nodes
* Selecting nodes
* Multi-selecting nodes
* Deleting nodes
* Duplicating nodes
* Undo/redo
* Connections between nodes
* Optional minimap if it improves the UX

Creating and manipulating nodes should feel fast and fluid.

Double-clicking an empty part of the canvas should create a new node.

## Nodes

The primary object is a flexible visual block.

Nodes should support:

* Editable text
* Resizing
* Moving
* Connecting to other nodes
* Duplicating
* Deleting

Support useful node styles/types such as:

* Standard
* Process
* Decision
* Input/Output
* Note
* Code

Do not make users choose a type every time they create a node. A normal node should be the default.

## Rich Text / Typography

Users should be able to format text inside nodes.

Support:

* Bold
* Italic
* Underline
* Strikethrough
* Font size
* Headings
* Bullet lists
* Numbered lists
* Inline code
* Text alignment
* Links

Keep the formatting UI minimal. Prefer a contextual/floating toolbar rather than permanently occupying large amounts of canvas space.

## Code

Clario is developer-focused, so code should be treated as a first-class content type.

Code blocks should support:

* Monospaced formatting
* Syntax highlighting
* Language selection
* Copying code

Prioritize common languages such as JavaScript, TypeScript, Python, Java, C/C++, Swift, SQL, and shell.

## Connections

Users should be able to visually connect nodes.

Connections should support:

* Directional arrows
* Optional labels
* Solid/dashed styles where appropriate

Creating connections should be intuitive and require minimal interaction.

## Groups / Sections

Allow related nodes to be visually grouped into sections.

Example uses:

* Frontend / Backend / Database
* Input / Processing / Output
* Authentication
* Algorithm stages

Groups should help organize large diagrams without interfering with normal canvas interaction.

## Keyboard-First UX

Clario should feel comfortable for developers who prefer keyboard shortcuts.

Implement sensible shortcuts such as:

* New node
* Delete
* Duplicate
* Undo
* Redo
* Select all
* Zoom in/out

Where appropriate, follow standard macOS/Windows conventions instead of inventing unusual shortcuts.

Consider a `/` command menu while editing a node for quickly inserting things such as headings, code, lists, etc.

## Canvas Management

Create a simple home/dashboard where users can:

* Create a canvas
* Open an existing canvas
* Rename a canvas
* Delete a canvas
* See basic information/preview for existing canvases

Changes should **autosave**. Users should not need to manually press Save.

## Templates

When creating a canvas, support:

* Blank
* Algorithm / LeetCode
* System Architecture
* User Flow
* Project Planning
* Concept Map

Templates should use the same underlying canvas system and simply provide useful starting structures.

---

# Design Direction

Clario should look like a polished modern developer tool.

Prioritize:

* Minimal UI
* Lots of usable canvas space
* Strong typography
* Subtle controls
* Smooth interactions
* Good dark mode
* Clear hierarchy
* Low visual clutter

Avoid making it look like an enterprise diagramming tool with dozens of permanently visible controls.

The canvas itself should be the focus.

Use your judgment for smaller UX/design decisions where the requirements don't specify an exact solution.

---

# Out of Scope for V1

Do NOT implement:

* AI generation
* AI agents
* Repository/codebase analysis
* Real-time collaboration
* Teams/workspaces
* Comments
* Complex version history
* Automatic architecture generation

Design the architecture so future functionality can reasonably be added, but don't overengineer v1 around hypothetical features.

---

# Milestones

## Milestone 1 — Foundation

Set up the application and establish the core architecture.

Complete when:

* Application runs locally
* Core project structure is established
* Main dashboard and canvas routes exist
* Base design system/theme is established
* Dark/light theme behavior is functional
* Basic canvas shell renders

## Milestone 2 — Core Canvas

Build the fundamental canvas interaction system.

Complete when users can:

* Pan
* Zoom
* Create nodes
* Move nodes
* Select nodes
* Multi-select
* Resize nodes
* Delete nodes
* Duplicate nodes
* Connect nodes

The canvas should already feel smooth enough to use for a basic flow diagram.

## Milestone 3 — Node Editing & Typography

Build the content-editing experience.

Complete when:

* Node text can be edited naturally
* Rich-text formatting works
* Font sizes/headings work
* Lists work
* Inline code works
* Links work
* Formatting UI is polished and unobtrusive

## Milestone 4 — Developer Features

Add developer-specific functionality.

Complete when:

* Code blocks work
* Syntax highlighting works
* Language selection works
* Code can be copied
* Decision/process/input-output/note styles exist
* Connection labels work
* Useful connection styling exists

## Milestone 5 — Organization & Productivity

Improve the experience for larger diagrams.

Complete when:

* Groups/sections work
* Keyboard shortcuts work
* Undo/redo works reliably
* `/` command menu works if appropriate
* Canvas navigation feels polished
* Minimap is added if useful

## Milestone 6 — Persistence & Dashboard

Make Clario usable as an actual persistent application.

Complete when:

* Canvases can be created
* Canvases can be renamed
* Canvases can be deleted
* Existing canvases can be reopened
* Nodes/connections/content/positions persist
* Changes autosave reliably
* Dashboard displays saved canvases

Choose an appropriate persistence approach for v1. Avoid unnecessary infrastructure if local persistence is sufficient for the initial product.

## Milestone 7 — Templates

Implement the initial template system.

Complete when users can create:

* Blank canvas
* Algorithm / LeetCode
* System Architecture
* User Flow
* Project Planning
* Concept Map

Templates should provide useful starting nodes/layouts without restricting what users can subsequently change.

## Milestone 8 — Polish & Release

Treat this milestone as a product-quality pass.

Focus on:

* Interaction bugs
* Edge cases
* Visual consistency
* Empty states
* Keyboard UX
* Responsive behavior
* Performance
* Autosave reliability
* Canvas interaction smoothness
* Accessibility where practical

Perform a complete user-flow test from creating a canvas through building, saving, closing, and reopening a diagram.

Update the README with:

* Product description
* Features
* Screenshots/placeholders where appropriate
* Tech stack
* Local setup instructions
* Project structure
* Known limitations

The result should feel like a coherent **Clario v1**, not a collection of partially finished features.

---

# Development Process

Work through the milestones **in order**.

Before starting each milestone:

1. Briefly state what you intend to implement.
2. Inspect the existing codebase and understand what is already there.
3. Decide on an appropriate implementation approach.

During each milestone:

* Implement the functionality.
* Run the application where useful.
* Test important interactions.
* Run lint/type checks/tests where available.
* Fix issues before considering the milestone complete.
* Keep components/modules reasonably separated.
* Avoid unnecessarily large files where clean extraction makes sense.
* Do not overengineer abstractions prematurely.

At the end of each milestone:

1. Review what you built.
2. Test the milestone's completion criteria.
3. Fix obvious issues.
4. Make a Git commit with a clear commit message.
5. Briefly report what was completed and any important implementation decisions.
6. Continue to the next milestone unless you encounter a decision that genuinely requires my input.

Make additional commits during milestones when there is a meaningful stable checkpoint. Do not wait until the entire project is finished to commit.

Maintain the README as the project evolves rather than leaving all documentation until the end.

You are allowed to make reasonable product, architecture, library, and implementation decisions independently. If an established library solves a difficult canvas, rich-text, or syntax-highlighting problem well, prefer evaluating that over unnecessarily rebuilding complex infrastructure from scratch.

The priority is to produce a polished, genuinely useful v1 while keeping the codebase understandable and maintainable.

Start by inspecting the current repository/environment, proposing the technical approach and stack, and then begin **Milestone 1 — Foundation**.
