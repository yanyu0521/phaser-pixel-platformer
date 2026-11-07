---
name: kenney-asset-finder
description: "Find and compare game assets in Kenney's preview index for a project's needs; verify pack names, previews, categories, and Phaser suitability before recommending."
---

# Kenney Asset Finder

Use this skill when the user wants to find, compare, or shortlist Kenney game asset packs for a game or project.

## Source

Start with Kenney's asset preview index: <https://kenney.nl/data/itch/preview/>. The page groups packs under All, 2D, 3D, UI, Icons, Audio, and Other, and includes a search field. It notes that some packages might not be displayed, so describe the page as a useful catalog rather than a complete inventory.

## Workflow

1. Turn the request into practical criteria: game genre, objects or environment needed, visual style, and intended use. If the request is broad, make a useful first shortlist instead of blocking on questions.
2. Inspect the current index with an available browser or web tool. Use its search and category filters, then verify candidate names and preview images on the page. If direct page reading fails, try the page in a browser. If the catalog still cannot be inspected, say so and do not invent current listings.
3. Select a small set of candidates that match the requested use. Explain what each pack appears to provide and why it fits. Do not infer exact contents, file formats, animation frames, tile sizes, or atlas structure from a pack name alone; inspect the preview or its product details when those facts matter.
4. For this project, which uses Phaser 4, prioritize 2D art, UI, icons, and audio when they meet the need. Treat packs listed under 3D as requiring a format and rendering-pipeline check before describing them as directly usable in the game.
5. Link the index and, when available, the relevant product or preview page. Verify price, license, and download details on the actual product page before making claims about them.
6. Present results in Traditional Chinese unless the user requests another language. A compact table can include the exact English pack name, Traditional Chinese name, category, what it contains or appears suited for, and fit notes. Keep the English names exactly as listed. State when a description is inferred from a title or preview.
7. A request to find or compare packs is read-only. Download, extract, or modify project files only when the user asks for that work.
