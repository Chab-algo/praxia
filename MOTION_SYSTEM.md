## Motion system (Framer Motion)

### Objectifs
- Donner du feedback rapide et clair.
- Guider l'attention (hierarchie visuelle).
- Rester sobre: motion utile, pas decoratif.

### Règles generales
- Motion court et discret sur actions courantes.
- Eviter les animations longues sur contenu dense (ex: analytics table).
- Toujours supporter reduced-motion.
- Les transitions doivent etre coherentes entre pages et composants.

### Tokens proposes (durations)
- `instant`: 0ms (reduced-motion)
- `fast`: 120ms (hover, press)
- `base`: 200ms (reveal, layout shift)
- `slow`: 320ms (page transition, panel expand)

### Easing proposes
- `easeOut`: [0.16, 1, 0.3, 1] (entrance, reveal)
- `easeIn`: [0.7, 0, 0.84, 0] (exit)
- `easeInOut`: [0.4, 0, 0.2, 1] (layout)

### Pattern library (exemples d'usage)

#### Page transition
- Opacite 0 -> 1 + translateY 8px
- `base` + `easeOut`
- Pas de transitions sur pages "data dense" (analytics table)

#### Cards et list items
- Hover: scale 1.0 -> 1.01 + shadow
- Press: scale 0.99
- `fast` + `easeInOut`

#### Buttons
- Hover: slight lift + color change
- Loading: spinner + text fade
- Success: check icon + color swap

#### Accordion / expand
- Height auto + opacity
- `base` + `easeInOut`

#### Form validation
- Error: subtle shake (2-3px), 1 cycle, `fast`
- Field focus: border + glow (no motion) or 120ms fade

#### Progress / status
- Progress bar: width animate, `slow`
- Status badge: pulse on running

#### Drag and drop (CRM)
- Drag ghost with scale 1.02
- Drop target highlight (bg fade), `fast`

### Reduced motion
Behavior:
- Remplacer animations par instant transitions.
- Garder les changements d'etat visuels (color, opacity).
Implementation:
- Respect `prefers-reduced-motion` via `useReducedMotion()`.

### Priorite d'application
1) CTA + feedback actions (create, run, save)
2) Onboarding steps
3) Recipes cards + filters
4) CRM drag/drop
5) Executions expand

### Notes d'integration
- Utiliser `motion` et `AnimatePresence` deja en place sur la landing.
- Centraliser les variants dans un module (ex: `frontend/src/lib/motion.ts`) pour coherences.
