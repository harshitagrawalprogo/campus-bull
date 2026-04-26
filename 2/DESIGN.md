# Design System Documentation: The High-Performance Academic Interface

## 1. Overview & Creative North Star
**Creative North Star: The Kinetic Scholar**
This design system moves away from the static, boxy layouts of traditional educational platforms and toward a high-velocity, editorial experience. It draws inspiration from high-end fintech and performance SaaS, treating student data with the same gravitas and precision as a stock market ticker or a luxury vehicle dashboard.

To break the "template" look, we utilize **Intentional Asymmetry**. For example, a heavy, high-contrast headline (`display-lg`) may be paired with a significant amount of white space to its right, allowing the information to breathe and feel more like a bespoke magazine than a database. Overlapping elements—such as a glassmorphic sidebar partially occluding a background gradient—create a sense of physical depth and kinetic energy.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian tones, punctuated by high-energy reds and golds.

### The "No-Line" Rule
**Explicit Instruction:** Sectioning via 1px solid borders is prohibited. Boundaries must be defined strictly through background color shifts or tonal transitions. To separate a navigation area from a content area, use `surface-container-low` against a `surface` background. The lack of hard lines creates a "futuristic" seamlessness.

### Surface Hierarchy & Nesting
We use the surface-container tiers to create a "nested" physical reality. Each layer closer to the user becomes slightly lighter:
*   **Base Layer:** `surface` (#131314) – The infinite void.
*   **Section Layer:** `surface-container-low` (#1C1B1C) – Broad structural areas (e.g., Sidebar background).
*   **Content Layer:** `surface-container` (#201F20) – Standard card backgrounds.
*   **Active/Interaction Layer:** `surface-container-highest` (#353436) – Tooltips or active states.

### The "Glass & Gradient" Rule
Floating elements (Modals, Hover Menus) should utilize Glassmorphism. Use a semi-transparent `surface-container` color with a `backdrop-blur` of 12px to 20px. 

**Signature Texture:** Main Call-to-Actions (CTAs) must use a linear gradient from `primary-container` (#D32F2F) to `primary` (#FFB3AC) at a 135-degree angle. This transition adds "soul" and visual depth that a flat red cannot achieve.

---

## 3. Typography
The system uses a dual-font strategy to balance performance with academic authority.

*   **Display & Headlines:** `Space Grotesk`. This font brings a technical, futuristic edge. Use `display-lg` (3.5rem) for high-impact moments like "Good Morning, Alex" to establish an editorial feel.
*   **Body & Labels:** `Inter`. Chosen for its supreme legibility in data-heavy environments.
*   **The Hierarchy Role:** Large headlines (`headline-lg`) act as anchors for the eye, while `label-sm` in `secondary` (Gold #F8BD2A) is used for high-importance metadata or "University Announcements," creating a distinct hierarchy of urgency.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural geometry.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The slight shift in hex value provides a soft, natural lift.
*   **Ambient Shadows:** For "floating" items (e.g., a dragged card), use a shadow with a blur of `16px` and an opacity of `6%`. The shadow color should not be black; it should be a tinted version of `on-surface` (#E5E2E3) to simulate natural light scattering.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.
*   **Interaction States:** On hover, a card should shift from `surface-container` to `surface-container-high`, providing immediate, haptic-like visual feedback without changing the layout.

---

## 5. Components

### Buttons
*   **Primary:** Linear Gradient (`primary-container` to `primary`), `8px` corner radius, white text. No border.
*   **Secondary:** `surface-container-highest` background, no border.
*   **Tertiary:** Transparent background, `primary` text, subtle `2px` underline on hover.

### Input Fields
*   **Style:** `surface-container-highest` background. No visible border.
*   **State:** On focus, the background shifts slightly lighter, and a `1.5px` "Ghost Border" of `primary` appears at 40% opacity.

### Cards & Lists
*   **Strict Rule:** No dividers. Use vertical white space (`spacing-6` or `spacing-8`) to separate items.
*   **Academic Cards:** Use `12px` (`md`) rounded corners. For dynamic data (like grades), use `label-md` with `secondary` (Gold) color to highlight the value.

### Chips
*   **Selection Chips:** Use `surface-container-highest` for unselected and a soft `primary_container` (Red) with 20% opacity for selected, keeping the text high-contrast.

---

## 6. Do's and Don'ts

### Do
*   **Do** use extreme vertical rhythm. Give headlines room to breathe (at least `spacing-12` above them).
*   **Do** use the "Red Gradient" sparingly for high-impact actions only.
*   **Do** rely on font weight (Bold vs. Regular) and color (Primary White vs. Secondary Gray) to separate content, not lines.

### Don't
*   **Don't** use 1px solid white or grey borders. It breaks the "high-performance" feel and makes the UI look dated.
*   **Don't** use standard "Drop Shadows" with high opacity. They muddy the dark theme.
*   **Don't** cram information. If a dashboard feels crowded, increase the `surface` area and use a `title-lg` font for the primary data point to draw the eye.