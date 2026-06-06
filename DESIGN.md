<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Prayer App
description: A grounded, timeless daily prayer companion — dark-first, editorial, reverent.
---

# Design System: Prayer App

## 1. Overview

**Creative North Star: "The Illuminated Manuscript"**

This is a daily prayer companion that should feel like a well-bound devotional held in low evening light: substantial, quiet, and rooted in tradition. Weight comes from typography, space, and earthen color, never from ornament or effect. An all-serif, editorial type voice carries the whole interface, so reading a prayer feels continuous with reading scripture. The dark theme is the primary surface, tuned for warm, non-glaring legibility during night prayer.

The palette is a full but muted earthen set — clay, olive, slate, and a parchment-ink for text — each role used deliberately rather than decoratively. Motion is restrained: gentle fades and state changes only, nothing that performs for the user. The aim is a refuge, not a feed.

This system explicitly rejects the generic SaaS dashboard (no metric cards, charts, or startup-blue), gamification (no confetti, badges, mascots, or streak-shaming), preachy church-bulletin clutter, and trendy flash (no neon gradients, decorative glassmorphism, or attention-grabbing motion).

**Key Characteristics:**
- Dark-first, warm low-light luminance
- All-serif editorial typography, like a printed prayer book
- Muted earthen full palette, used by role
- Restrained motion; reverence over engagement
- Substantial through space and type, not ornament

## 2. Colors

A muted, earthen full palette: warm darks for surface, with clay, olive, and slate as deliberate role colors and a soft parchment-ink for text. `[Exact values to be resolved during implementation in OKLCH.]`

### Primary
- **Clay** `[to be resolved during implementation]`: the anchoring warm tone, used for primary actions and key emphasis. Carries warmth without shouting.

### Secondary
- **Olive** `[to be resolved during implementation]`: a grounded secondary role for supporting accents, selected states, and quiet markers of continuity.

### Tertiary
- **Slate** `[to be resolved during implementation]`: cool counterweight for structure, dividers-with-intent, and secondary information.

### Neutral
- **Deep Earth** `[to be resolved during implementation]`: the dark-first body surface — warm, near-black, tuned for low-light legibility, not pure black.
- **Raised Earth** `[to be resolved during implementation]`: a slightly lifted surface for grouped content (tonal, not shadowed).
- **Parchment Ink** `[to be resolved during implementation]`: primary text — warm off-white at strong contrast (target AAA for body where feasible).
- **Muted Ink** `[to be resolved during implementation]`: secondary text, kept well above AA, never light-gray-for-elegance.

### Named Rules
**The Earthen Rule.** Every color is muted and drawn from earth, not from a brand-blue or neon family. If a color reads as "tech" or "candy," it does not belong here.

**The Warm-Dark Rule.** The dark surface is warm and near-black, never pure `#000`. Night legibility is a design constraint, not a theme toggle.

## 3. Typography

**Display Font:** `[serif to be chosen at implementation]` (with Georgia, serif fallback)
**Body Font:** same serif family in reading weights (with Georgia, serif fallback)
**Label/Mono Font:** `[optional, only if UI labels need separation]`

**Character:** A single editorial serif throughout gives the app the continuity of a printed devotional. Hierarchy is built from scale and weight contrast within one family, not from competing typefaces.

### Hierarchy
- **Display** (`[weight/size/clamp tbd]`): prayer titles and section openings; hero ceiling ≤ 6rem, letter-spacing ≥ -0.04em.
- **Headline** (`[tbd]`): screen and group headings.
- **Title** (`[tbd]`): card/list item headings, prayer names.
- **Body** (`[tbd]`): prayer and scripture text; cap line length at 65–75ch, comfortable size for older eyes.
- **Label** (`[tbd]`): sparse UI labels and metadata; reserve uppercase for short labels only, never body copy.

### Named Rules
**The One Family Rule.** Contrast comes from weight and scale within one serif, not from a second typeface. At most one supporting family, and only if UI truly needs it.

**The Sacred Text Rule.** Prayer and scripture passages get the most generous size, line-height, and measure on any screen. They are the reason the screen exists.

## 4. Elevation

Flat by default, with tonal layering rather than shadows. Depth is conveyed by warm surface steps (Deep Earth → Raised Earth), not by drop shadows or glassmorphism. Motion is restrained, so surfaces do not lift or animate to attract attention.

### Named Rules
**The Tonal Depth Rule.** Separation is achieved with a lighter warm surface, not a shadow. If a shadow appears at all, it is a soft, low ambient response to a deliberate state, never a default card lift.

## 5. Components

`[No components exist yet — re-run /impeccable document after implementation to capture real component tokens and generate the .impeccable/design.json sidecar.]`

## 6. Do's and Don'ts

### Do:
- **Do** treat the warm dark theme as the primary surface, tuned for low-light night prayer.
- **Do** build hierarchy from one editorial serif via scale and weight contrast.
- **Do** give prayer and scripture text the most generous measure, size, and line-height on screen.
- **Do** keep all color muted and earthen, used strictly by role.
- **Do** keep motion to gentle fades and state changes, with full `prefers-reduced-motion` support.
- **Do** track faithfulness gently — encourage return without ever shaming a missed day.

### Don't:
- **Don't** build a generic SaaS dashboard: no metric cards, charts, KPI tiles, or startup-blue.
- **Don't** gamify: no confetti, loud badges, cartoon mascots, or aggressive streak pressure.
- **Don't** go preachy or heavy-handed: no cluttered scripture walls, guilt nudges, or church-bulletin aesthetics.
- **Don't** chase trends: no neon gradients, decorative glassmorphism, or attention-grabbing motion.
- **Don't** use pure black for the dark surface, or light-gray body text "for elegance" — both fail the warmth and contrast constraints.
- **Don't** introduce a second competing typeface; stay within one serif family.
