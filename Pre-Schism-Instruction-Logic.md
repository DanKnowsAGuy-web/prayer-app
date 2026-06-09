# THE PRE-SCHISM INTERCESSORY CYCLE
## Instruction File: How the App Serves the Prayers

*This is the logic file. It contains no prayers. It describes how an app should choose which prayer to show on a given day, using the prayers in the companion content file. The content can be edited without touching this file, and this file can change without re-editing the content.*

---

## 1. Terms (used the same way everywhere)

- **Theme**: one of the seven groups of prayers (Church, Civil, Seekers, Poor, Sick, Penitence, Saints).
- **Entry**: a single prayer within a theme, identified by its stable code, for example `CHURCH-WESTSYRIAC`.
- **Pool**: all the entries belonging to one theme. Pools are different sizes.
- **Cycle Day**: one served step. Day 1 is the first day of the cycle. The Prologue is served once before Day 1.

---

## 2. Data model (what each entry carries)

Each entry in the content file has:

- **id**: stable, unique, never changes (for example `SAINTS-CELTIC`). The app keys on this, never on position.
- **prayer**: the displayed text.
- **attribution**: the italic line shown beneath the prayer (manuscript, tradition, century).
- **provenance**: `sourced` or `adapted`. Hidden from the reader. For filtering and integrity only.
- **revised**: `yes` or `no`. Hidden. Whether the wording was modernized from the strict historic text.

The reader sees only the prayer and the attribution. The id, provenance, and revised fields are internal.

---

## 3. The core idea

Two things move. The **theme** advances by one every Cycle Day and loops through the seven in order. Each **theme keeps its own place** in its pool, and advances to its next entry only when that theme comes around again, which is every seven days. So a reader prays a different theme each day, and each theme works slowly through its own set of traditions over many weeks.

---

## 4. The serving rule (stateless, exact)

The app does not need to remember anything day to day. Given the Cycle Day number `D` (an integer, Day 1 onward), it computes exactly what to serve. This makes missed days, time zones, and reinstalls harmless.

Let the seven themes be numbered in this fixed order:

1 Church, 2 Civil, 3 Seekers, 4 Poor, 5 Sick, 6 Penitence, 7 Saints.

Let `poolSize[t]` be the number of entries in theme `t` (see the table in section 6).

For a given Cycle Day `D`:

```
theme       t   = ((D - 1) mod 7) + 1
pass        p   = floor((D - 1) / 7)
startOffset o   = (t - 1) mod poolSize[t]
entryIndex  i   = (o + p) mod poolSize[t]      // 0-based
```

Serve the entry at index `i` in theme `t`'s pool, where the pool is taken in the order the entries are listed in the content file.

That is the whole engine. `t` picks the theme for the day. `p` is how many times that theme has already come up. `o` is the theme's staggered starting position. `i` is the entry to show.

---

## 5. Why the staggered start matters (do not skip this)

Every theme's pool happens to be listed in the same tradition order, beginning with West Syriac. If each theme simply started at its first entry, then Days 1 through 7 would all serve the West Syriac prayer, one per theme, seven West Syriac days in a row, then seven Alexandrian days, and so on. That is the opposite of the diversity the cycle is for.

The `startOffset` term fixes this by starting each theme at a different point in its pool. With it, the opening week serves seven different traditions. The offset `(t - 1) mod poolSize[t]` is the simple, deterministic choice; any fixed set of distinct offsets works, and they could be hand-tuned later if you want a specific opening sequence. The essential rule is: **the seven themes must not all start at the same position in their pools.**

---

## 6. Pool sizes and recurrence

| Theme | Pool size | A given prayer in it recurs every |
|-------|-----------|-----------------------------------|
| Church | 10 | 70 days |
| Civil | 7 | 49 days |
| Seekers | 6 | 42 days |
| Poor | 8 | 56 days |
| Sick | 6 | 42 days |
| Penitence | 12 | 84 days |
| Saints | 9 | 63 days |

The recurrence is simply 7 times the pool size, because the theme returns every 7 days and then advances one entry. The soonest any prayer repeats is 42 days (Seekers and Sick, the two smallest pools). Most repeat far less often. There is no single overall loop length; the themes drift against one another, so the full sequence does not visibly repeat in ordinary use.

A reader will notice that Seekers and Sick come back around faster than the rest, since their pools are smallest. If that unevenness ever bothers you, the fix is to deepen those two pools with genuine native texts from the Sourcing Worklist, not to change this logic.

---

## 7. Worked example: the first fourteen days

Using the rule above:

| Day | Theme | Entry served |
|-----|-------|--------------|
| 1 | Church | CHURCH-WESTSYRIAC |
| 2 | Civil | CIVIL-ALEXANDRIAN |
| 3 | Seekers | SEEKERS-ROMAN |
| 4 | Poor | POOR-CARTHAGINIAN |
| 5 | Sick | SICK-BYZANTINE |
| 6 | Penitence | PENITENCE-ARMENIAN |
| 7 | Saints | SAINTS-RAVENNA |
| 8 | Church | CHURCH-ALEXANDRIAN |
| 9 | Civil | CIVIL-ROMAN |
| 10 | Seekers | SEEKERS-BYZANTINE |
| 11 | Poor | POOR-EASTSYRIAC |
| 12 | Sick | SICK-CELTIC |
| 13 | Penitence | PENITENCE-BYZANTINE |
| 14 | Saints | SAINTS-MOZARABIC |

Note the opening week spans seven different traditions, which is the point.

---

## 8. The Prologue

The Prologue (`PROLOGUE-DIDACHE`) sits outside the rotation. Serve it once, on the reader's first day, before Day 1, as an opening. After that it is not shown again in the normal cycle, though the app may offer it as a "begin again" or "about" reading.

---

## 9. Same-tradition-on-adjacent-days (optional refinement)

Because the themes advance independently, two consecutive days can occasionally land on the same tradition (for example a Roman prayer one day and another Roman prayer the next). The staggered start makes this uncommon, and it is harmless, since the two prayers are different texts. Three ways to handle it, in order of simplicity:

1. **Do nothing.** Accept the rare repeat. Recommended. It is not a defect.
2. **Skip on collision.** If today's entry shares a tradition with yesterday's, advance that theme's pointer by one extra step for today only. Simple, and removes all adjacent repeats.
3. **Pre-arrange pools.** Hand-order each pool so collisions cannot occur. Most control, most upkeep.

Pick one and state it in the build. If unsure, use option 1.

---

## 10. Display rules

- Show the prayer text prominently.
- Show the attribution line quietly beneath it, in italics or a muted style.
- Do not show the id, provenance, or revised fields.
- The `revised` field exists so that, if you ever offer a "show the original historic wording" toggle, the app knows which entries were modernized. Optional.

Note on attribution honesty: this content set contains only native and adapted prayers, so every attribution is the prayer's true origin. If a future edition ever reintroduces borrowed (surrogate) prayers to fill gaps, the agreed rule is that a borrowed Roman prayer shows only its century and not the name "Roman," while borrowed non-Roman prayers keep their true origin name. That rule does not apply to the current content, since nothing here is borrowed.

---

## 11. Editing and maintenance

- **Adding an entry** to a theme: give it a unique id, add it to that theme's pool in the content file, and update `poolSize` for that theme. The recurrence distance for that theme grows automatically.
- **Removing an entry**: delete it by id and decrement `poolSize`. Because the app keys on id and computes by pool size, nothing else breaks.
- **Reordering a pool**: safe. The engine uses position only within the current listed order, recomputed fresh each day.
- **Revising wording**: edit the prayer text and set `revised: yes`. No logic change.
- Keep the seven theme names and their fixed order stable, since the serving rule depends on them.

---

*End of instruction file. Paired with the master content file, these two documents fully specify the cycle: the content holds the prayers, this file holds the rules, and the app needs nothing else to run it.*
