# Clocks on Time — design notes

The people using this app are in their 60s and 70s, working on a Windows laptop. Every choice below follows from that.

## Principles

- **Words on every button.** No icon-only controls, no actions hidden behind hover or a keyboard shortcut.
- **One way to do each thing.** Search and sort live in one panel. A record opens as one page. Saving is one button.
- **Nothing is saved until Save is pressed.** The Enter key never saves. Leaving a changed record always asks first.
- **Nothing is lost by accident.** Dialogs do not close on an outside click. Delete can be undone.
- **Never colour alone.** Flags carry the day count; status carries its word.

## Sizes

| Token | Value | Used for |
| --- | --- | --- |
| `--t-base` | 16px | Body, table cells, inputs, buttons |
| `--t-sm` | 14px | Hints, table headings, flags (smallest size used) |
| `--t-lg` | 18px | Primary buttons, dialog text, messages |
| `--t-h1` | 28px | Page title |
| `--control` | 46px | Minimum height of every button and input |

The top bar has a three-step text size control (100%, 115%, 130%) that is remembered between sessions.

## Colour

Tokens live in `src/styles/variables.css`.

- Accent: bronze `--accent` for the primary action and the selected state.
- Text: `--ink`, `--ink-2`, `--ink-3`. All three pass 4.5:1 on white and on the page background.
- Input borders: `--line-strong`, 3:1 against white so fields are easy to find.
- Aging flags: yellow at 45–75 days since the date entered, red after 75 days. Completed records are never flagged.
- Focus: a 3px blue ring on every control.

## Layout

- Top bar: shop name, the two lists (Waiting List, Completed), text size, backup.
- List page: search and sort panel, then the table. The page scrolls, not the table, so there is only one scrollbar.
- Record page: one record, Previous/Next through whatever the list is showing, a Save bar pinned to the bottom of the card.
- Tested at 1280×800 and at 1093×614 (a 1366×768 laptop at 125% scaling) with no sideways scrolling.

## Printing

`PrintSheet` is hidden on screen and is the only thing shown under `@media print`. Print and Save as PDF both use it, so paper and PDF always match.
