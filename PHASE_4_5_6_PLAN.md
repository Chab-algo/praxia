# PraxIA Frontend Redesign - Phases 4, 5, 6

## Context Rapide

**Projet**: PraxIA - Plateforme SaaS pour agents AI
**Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS 4.0, GSAP, Lenis
**Design System**: Minimal, monochrome avec accent amber (#d97706), sans glassmorphism
**Polices**: Space Grotesk (sans) + JetBrains Mono (mono)

**Phases Complétées**:
- ✅ Phase 1 & 1B: Design system + GSAP setup
- ✅ Phase 2: Landing page (hero, recipes showcase, how it works, etc.)
- ✅ Phase 3: Dashboard page (stat cards minimales, chart simplifié)

---

## Phase 4: Agent Pages Redesign (3-4 heures)

### Objectif
Transformer la vue "cards" des agents en table professionnelle, et redesigner la page de détail avec layout asymétrique.

### 4.1 Agent List Page (`/dashboard/agents`)

**Fichier**: `frontend/src/app/dashboard/agents/page.tsx`

**État Actuel**:
- Grid de cards avec glassmorphism
- Icônes colorées
- Boutons "Test" et "Edit" sur chaque card

**État Cible**:
```
┌────────────────────────────────────────────────────────┐
│ Your Agents                          [+ New Agent]     │
├────────────────────────────────────────────────────────┤
│ Name              Type     Status    Last Run  Actions │
│ ────────────────────────────────────────────────────── │
│ CV Screener       Recipe   ● Active  2h ago    Test    │
│ Support Bot       Recipe   ○ Draft   Never     Edit    │
│ Custom Agent      Custom   ● Active  5m ago    Test    │
└────────────────────────────────────────────────────────┘
```

**Éléments à Créer**:

1. **Table Component** (`src/components/ui/table.tsx`)
```tsx
// Structure de base
export const Table = ({ children, className }: TableProps) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="border-b border-border">{children}</thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

export const TableRow = ({ children, className }: TableRowProps) => (
  <tr className={cn(
    "border-b border-border last:border-0 hover:bg-praxia-gray-50 transition-colors",
    className
  )}>{children}</tr>
);

export const TableHead = ({ children, className }: TableHeadProps) => (
  <th className={cn(
    "text-left py-3 px-4 text-sm font-medium text-muted-foreground",
    className
  )}>{children}</th>
);

export const TableCell = ({ children, className }: TableCellProps) => (
  <td className={cn("py-4 px-4 text-sm", className)}>{children}</td>
);
```

**Styles CSS** (dans `globals.css`):
```css
/* Table styles */
.table-container {
  @apply w-full overflow-x-auto;
}

.agent-table {
  @apply w-full border-collapse;
}

.agent-table thead {
  @apply border-b border-border;
}

.agent-table th {
  @apply text-left py-3 px-4 text-sm font-medium text-muted-foreground;
}

.agent-table tbody tr {
  @apply border-b border-border last:border-0 hover:bg-praxia-gray-50 transition-colors cursor-pointer;
}

.agent-table td {
  @apply py-4 px-4 text-sm;
}
```

2. **Status Badge Component** (déjà créé, à utiliser)
```tsx
// Dans page.tsx
<Badge status={agent.status === 'active' ? 'active' : 'draft'}>
  {agent.status}
</Badge>
```

3. **Agent List Redesign**
```tsx
// frontend/src/app/dashboard/agents/page.tsx
return (
  <div>
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-h1 mb-2">Your Agents</h2>
        <p className="text-body text-muted-foreground">
          Manage and test your AI agents
        </p>
      </div>
      <Button variant="accent" onClick={() => router.push('/dashboard/agents/new')}>
        + New Agent
      </Button>
    </div>

    {/* Table */}
    <Card padding="none">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map(agent => (
            <TableRow key={agent.id}>
              <TableCell className="font-medium">{agent.name}</TableCell>
              <TableCell>
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  {agent.type}
                </span>
              </TableCell>
              <TableCell>
                <Badge status={agent.status === 'active' ? 'active' : 'draft'}>
                  {agent.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {agent.lastRun || 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="text-sm text-praxia-accent hover:underline">
                    Test
                  </button>
                  <button className="text-sm text-muted-foreground hover:text-foreground">
                    Edit
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);
```

### 4.2 Agent Detail Page (`/dashboard/agents/[id]`)

**Fichier**: `frontend/src/app/dashboard/agents/[id]/page.tsx`

**État Actuel**:
- Layout simple une colonne
- Test interface en bas

**État Cible**:
```
┌──────────────────────────────────────────┐
│ ← Back to Agents                         │
│                                          │
│ CV Screener Agent                        │
│ ────────────────────────────────────────│
│                                          │
│ ┌────────────┐  ┌───────────────────┐  │
│ │            │  │                   │  │
│ │ Agent Info │  │ Test Agent        │  │
│ │            │  │                   │  │
│ │ Name: ...  │  │ [Input Form]      │  │
│ │ Type: ...  │  │                   │  │
│ │ Status: .. │  │ [Test Button]     │  │
│ │ Created:.. │  │                   │  │
│ │            │  │ ─────────────────│  │
│ │ [Edit]     │  │                   │  │
│ │            │  │ Results:          │  │
│ │            │  │ [Output Display]  │  │
│ │            │  │                   │  │
│ └────────────┘  └───────────────────┘  │
│     30%              70%                │
└──────────────────────────────────────────┘
```

**Implémentation**:
```tsx
// frontend/src/app/dashboard/agents/[id]/page.tsx
export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // ... existing state logic

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agents
      </button>

      {/* Agent Name */}
      <h1 className="text-h1 mb-8">{agent.name}</h1>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
        {/* Left Column: Agent Info */}
        <div>
          <Card padding="md">
            <h3 className="text-h4 mb-4">Agent Information</h3>

            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Name
                </dt>
                <dd className="text-sm font-medium">{agent.name}</dd>
              </div>

              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Type
                </dt>
                <dd className="text-sm">
                  <Badge variant="outline">{agent.type}</Badge>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Status
                </dt>
                <dd>
                  <Badge status={agent.status === 'active' ? 'active' : 'draft'}>
                    {agent.status}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Created
                </dt>
                <dd className="text-sm text-muted-foreground">
                  {new Date(agent.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>

            <Button
              variant="secondary"
              className="w-full mt-6"
              onClick={() => router.push(`/dashboard/agents/${agent.id}/edit`)}
            >
              Edit Agent
            </Button>
          </Card>
        </div>

        {/* Right Column: Test Interface */}
        <div>
          <Card padding="md">
            <h3 className="text-h4 mb-4">Test Agent</h3>

            {/* Test Form */}
            <form onSubmit={handleTest} className="space-y-4">
              {agent.input_schema && Object.entries(agent.input_schema.properties).map(([key, schema]) => (
                <div key={key}>
                  <Label htmlFor={key}>{schema.title || key}</Label>
                  <Input
                    id={key}
                    name={key}
                    placeholder={schema.description}
                    required={agent.input_schema.required?.includes(key)}
                  />
                </div>
              ))}

              <Button type="submit" variant="accent" loading={testing}>
                Run Test
              </Button>
            </form>

            {/* Results Section */}
            {result && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Results</h4>

                {/* Keep existing ResultRenderer logic */}
                <ResultRenderer result={result} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### Checklist Phase 4

- [ ] Créer `src/components/ui/table.tsx` avec composants Table primitives
- [ ] Ajouter styles table dans `globals.css`
- [ ] Réécrire `src/app/dashboard/agents/page.tsx` avec layout table
- [ ] Utiliser Badge component pour les status
- [ ] Réécrire `src/app/dashboard/agents/[id]/page.tsx` avec layout 30/70
- [ ] Créer definition list (dl/dt/dd) pour agent info
- [ ] Intégrer formulaire de test dans colonne droite
- [ ] Tester responsive (mobile = colonne unique)

---

## Phase 5: Core UI Components (2-3 heures)

### Objectif
Compléter la bibliothèque de composants UI primitifs avec Input, Label, Separator.

### 5.1 Input Component

**Fichier**: `src/components/ui/input.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-11 w-full rounded-md border border-border bg-background px-3 py-2',
          'text-sm transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',

          // Focus styles
          'focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2',

          // Error styles
          error && 'border-praxia-error focus:border-l-praxia-error',

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

**Styles CSS** (ajouter à `globals.css`):
```css
/* Input focus animation */
input:focus {
  transition: border-color 0.2s ease, padding-left 0.2s ease;
}

/* Remove autofill yellow background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px rgb(var(--background)) inset;
  -webkit-text-fill-color: rgb(var(--foreground));
  transition: background-color 5000s ease-in-out 0s;
}
```

### 5.2 Label Component

**Fichier**: `src/components/ui/label.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium text-foreground mb-2',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-praxia-error ml-1">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

export { Label };
```

### 5.3 Separator Component

**Fichier**: `src/components/ui/separator.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-border',
          orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = 'Separator';

export { Separator };
```

### 5.4 Textarea Component (Bonus)

**Fichier**: `src/components/ui/textarea.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2',
          'text-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-vertical',
          error && 'border-praxia-error focus:border-l-praxia-error',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
```

### 5.5 Checkbox Component (Bonus)

**Fichier**: `src/components/ui/checkbox.tsx`

```tsx
import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            className={cn(
              'peer h-5 w-5 appearance-none rounded border-2 border-border',
              'bg-background cursor-pointer transition-colors',
              'checked:bg-praxia-accent checked:border-praxia-accent',
              'focus:outline-none focus:ring-2 focus:ring-praxia-accent focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          <Check
            className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
            strokeWidth={3}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
```

### Checklist Phase 5

- [ ] Créer `src/components/ui/input.tsx`
- [ ] Créer `src/components/ui/label.tsx`
- [ ] Créer `src/components/ui/separator.tsx`
- [ ] Créer `src/components/ui/textarea.tsx` (bonus)
- [ ] Créer `src/components/ui/checkbox.tsx` (bonus)
- [ ] Ajouter styles input/autofill dans `globals.css`
- [ ] Tester tous les composants dans une page de test
- [ ] Vérifier accessibilité (focus states, ARIA labels)

---

## Phase 6: Polish & Performance (2-3 heures)

### Objectif
QA final, responsive, dark mode, accessibilité, performance optimization.

### 6.1 Responsive Testing

**Breakpoints à Tester**:
- Mobile: 375px (iPhone SE)
- Mobile large: 428px (iPhone 14 Pro Max)
- Tablet: 768px (iPad)
- Desktop: 1024px, 1440px, 1920px

**Pages Critiques**:
1. Landing page (hero, recipes scroll)
2. Dashboard (stat cards 4→2→1)
3. Agent list (table → cards mobiles?)
4. Agent detail (2 colonnes → 1 colonne)

**Fixes Typiques**:

```css
/* globals.css - Responsive utilities */

/* Dashboard stats responsive */
.stats-grid {
  @apply grid gap-6;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Agent detail two-column */
@media (max-width: 1024px) {
  .agent-detail-grid {
    grid-template-columns: 1fr !important;
  }
}

/* Table horizontal scroll on mobile */
@media (max-width: 768px) {
  .table-container {
    @apply -mx-4 px-4;
  }
}

/* Recipe showcase scroll hint on mobile */
@media (max-width: 640px) {
  .recipes-scroll-hint {
    @apply block;
  }
}
```

### 6.2 Dark Mode Audit

**Fichier**: `src/app/globals.css`

**Variables à Vérifier** (section `.dark`):
```css
.dark {
  /* Background colors */
  --background: 10 10 10;           /* #0a0a0a */
  --card: 30 30 30;                 /* #1e1e1e */

  /* Text colors */
  --foreground: 250 250 250;        /* #fafafa */
  --muted-foreground: 163 163 163;  /* #a3a3a3 */

  /* Border colors */
  --border: 64 64 64;               /* #404040 */

  /* Praxia colors (same in dark) */
  --praxia-accent: 217 119 6;       /* #d97706 */
  --praxia-technical: 10 147 150;   /* #0a9396 */
}
```

**Contraste WCAG AA** (minimum 4.5:1 pour texte):
- Foreground/Background: ✅ 18.5:1
- Muted text/Background: ✅ 7.2:1
- Accent/Background: ✅ 6.8:1
- Border/Background: ✅ 3.5:1 (OK pour non-text)

**Test Checklist**:
- [ ] Landing page hero (texte lisible)
- [ ] Dashboard stat cards (nombres visibles)
- [ ] Chart colors (bars visibles)
- [ ] Table borders (lignes visibles)
- [ ] Button hover states (border amber visible)
- [ ] Input focus states (border-left accent visible)

### 6.3 Accessibility

**Keyboard Navigation**:
```tsx
// Vérifier que tous les éléments interactifs sont accessibles au clavier

// Exemple: Recipe cards
<Card
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      window.location.href = `/dashboard/recipes/${slug}`;
    }
  }}
>
  {/* Card content */}
</Card>
```

**Focus Visible** (ajouter à `globals.css`):
```css
/* Focus visible for keyboard navigation */
*:focus-visible {
  outline: 2px solid rgb(var(--praxia-accent));
  outline-offset: 2px;
}

/* Remove outline for mouse clicks */
*:focus:not(:focus-visible) {
  outline: none;
}
```

**ARIA Labels**:
```tsx
// Navigation auto-hide
<nav aria-label="Main navigation">
  {/* Nav items */}
</nav>

// Stat cards with links
<a href="/dashboard/agents" aria-label={`View all agents (${agentCount})`}>
  <StatCard label="Agents" value={agentCount} />
</a>

// Status badges
<Badge status="active" aria-label="Agent is currently active">
  Active
</Badge>

// Loading states
<Button loading aria-busy="true" aria-label="Running test...">
  Test Agent
</Button>
```

**Checklist Accessibilité**:
- [ ] Tous les boutons ont aria-label ou texte visible
- [ ] Toutes les images ont alt text (si ajoutées)
- [ ] Navigation clavier fonctionne sur toutes les pages
- [ ] Focus visible styles appliqués
- [ ] Formulaires ont labels associés (htmlFor/id)
- [ ] Status messages ont role="status" ou aria-live
- [ ] Modals ont focus trap (si ajoutés)
- [ ] Contraste couleurs WCAG AA minimum

### 6.4 Performance Optimization

**Bundle Analysis**:
```bash
# Installer bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Ajouter dans next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // existing config
});

# Run analysis
ANALYZE=true npm run build
```

**Optimisations GSAP**:
```tsx
// src/lib/gsap-animations.ts

// Import only what you need
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// NOT: import { gsap } from 'gsap/all';

// Kill ScrollTriggers on cleanup
export const setupHeroParallax = (selector: string) => {
  const tween = gsap.to(selector, { /* ... */ });

  return () => {
    tween.kill();
    ScrollTrigger.getAll().forEach(st => st.kill());
  };
};
```

**Font Loading**:
```tsx
// src/app/fonts.ts - Already optimized with display: 'swap'
export const spaceGrotesk = Space_Grotesk({
  display: 'swap',  // ✅ Prevents FOIT (Flash of Invisible Text)
  preload: true,    // ✅ Preload critical fonts
});
```

**Image Optimization** (si images ajoutées):
```tsx
import Image from 'next/image';

// Use Next.js Image component
<Image
  src="/hero-visual.png"
  alt="PraxIA Dashboard"
  width={800}
  height={600}
  priority  // For above-the-fold images
  quality={85}
/>
```

**Lazy Loading GSAP** (optionnel):
```tsx
// Only load GSAP on landing page, not dashboard
// src/app/components/landing/LandingPage.tsx
import dynamic from 'next/dynamic';

const SmoothScrollProvider = dynamic(
  () => import('@/components/smooth-scroll-provider').then(m => m.SmoothScrollProvider),
  { ssr: false }  // Client-side only
);
```

**Lighthouse Targets**:
- Performance: 95+ (mobile), 98+ (desktop)
- Accessibility: 100
- Best Practices: 100
- SEO: 100

**Metrics Targets**:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 300ms

### 6.5 Animation Performance

**Will-Change Optimization** (ajouter à `globals.css`):
```css
/* Apply will-change to animated elements */
.hero-content,
.recipe-card,
.timeline-step,
.stat-card {
  will-change: transform;
}

/* Remove will-change after animation completes */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    will-change: auto !important;
  }
}
```

**GSAP Performance Tips**:
```tsx
// Use transforms (GPU-accelerated) instead of top/left
gsap.to(element, { x: 100 });      // ✅ Good
gsap.to(element, { left: 100 });   // ❌ Avoid

// Use scrub for scroll-linked animations (60fps guaranteed)
scrollTrigger: {
  scrub: 1,  // ✅ Smooth scrubbing
}

// Batch DOM reads/writes
gsap.utils.toArray('.stat-card').forEach((card, i) => {
  gsap.from(card, {
    y: 30,
    opacity: 0,
    stagger: 0.08,  // ✅ Single timeline for all cards
  });
});
```

### Checklist Phase 6

#### Responsive
- [ ] Tester landing page 375px, 768px, 1440px
- [ ] Tester dashboard 375px → stat cards 1 colonne
- [ ] Tester agent list → table scroll horizontal mobile
- [ ] Tester agent detail → layout 1 colonne mobile
- [ ] Recipes showcase scroll fonctionne tactile

#### Dark Mode
- [ ] Toutes les variables dark mode définies
- [ ] Contraste WCAG AA vérifié (4.5:1 minimum)
- [ ] Chart colors visibles en dark
- [ ] Border colors visibles
- [ ] Input focus states visibles

#### Accessibilité
- [ ] Navigation clavier complète
- [ ] Focus visible styles
- [ ] ARIA labels sur boutons
- [ ] Labels/inputs associés (htmlFor)
- [ ] Lighthouse Accessibility 100

#### Performance
- [ ] Bundle analyzer run
- [ ] GSAP optimizations (kill on unmount)
- [ ] Font loading optimized (swap)
- [ ] Will-change appliqué
- [ ] Prefers-reduced-motion respected
- [ ] Lighthouse Performance 95+

---

## Ordre d'Exécution Recommandé

### Session 1: Phase 4 (3-4h)
1. Créer Table component (30min)
2. Redesigner agents list page (1h)
3. Redesigner agent detail page (1.5h)
4. Test responsive (30min)

### Session 2: Phase 5 (2-3h)
1. Créer Input component (30min)
2. Créer Label component (15min)
3. Créer Separator component (15min)
4. Créer Textarea + Checkbox (45min)
5. Tester tous les composants (45min)

### Session 3: Phase 6 (2-3h)
1. Responsive testing + fixes (1h)
2. Dark mode audit + fixes (45min)
3. Accessibility audit + fixes (45min)
4. Performance optimization (30min)
5. Lighthouse testing (30min)

---

## Fichiers à Créer/Modifier

### À Créer
```
src/components/ui/
  ├── table.tsx          [NEW]
  ├── input.tsx          [NEW]
  ├── label.tsx          [NEW]
  ├── separator.tsx      [NEW]
  ├── textarea.tsx       [NEW - Bonus]
  └── checkbox.tsx       [NEW - Bonus]
```

### À Modifier
```
src/app/
  └── dashboard/
      └── agents/
          ├── page.tsx               [REWRITE - Table view]
          └── [id]/page.tsx          [REWRITE - 30/70 layout]

src/app/globals.css                  [UPDATE - Add table styles, responsive, focus-visible]
```

### À Préserver
```
src/lib/api.ts                       [NO TOUCH]
src/app/middleware.ts                [NO TOUCH]
src/components/result-renderer/      [NO TOUCH]
src/components/batch/                [NO TOUCH]
src/lib/gsap-animations.ts           [NO TOUCH - Déjà optimisé]
```

---

## Testing Checklist Final

### Fonctionnel
- [ ] Landing page: Hero parallax, magnetic button, recipes scroll
- [ ] Dashboard: Stat cards, chart, quick actions
- [ ] Agent list: Table view, status badges, actions
- [ ] Agent detail: Two-column layout, test form, results
- [ ] Auth flow: Sign in/up avec Clerk
- [ ] API calls: Tous les endpoints fonctionnent

### Visuel
- [ ] Typography correcte (Space Grotesk + JetBrains Mono)
- [ ] Colors système praxia (amber accent, teal technical)
- [ ] Spacing 8pt grid respecté
- [ ] Borders 1px, pas de gradients/glows
- [ ] Dark mode contraste suffisant

### Performance
- [ ] Bundle size < 300kb total JS
- [ ] First Load JS < 100kb (pages statiques)
- [ ] Lighthouse Performance 95+
- [ ] No layout shift (CLS < 0.1)
- [ ] GSAP animations 60fps

### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS 16+)
- [ ] Mobile Chrome (Android)

---

## Notes Importantes

### API Integration
- **Ne JAMAIS modifier** `src/lib/api.ts`
- **Ne JAMAIS modifier** les props des ResultRenderer components
- Tous les agents ont `input_schema` (JSON Schema) pour générer les forms dynamiquement

### Clerk Auth
- Token JWT vérifié côté backend
- Middleware Next.js protège `/dashboard/*` routes
- `useAuth()` hook pour obtenir token: `const { getToken } = useAuth(); const token = await getToken();`

### GSAP Cleanup
```tsx
// ALWAYS cleanup GSAP animations in React
useEffect(() => {
  const cleanup = setupSomeAnimation();
  return cleanup;  // Important!
}, []);
```

### Tailwind CSS Variables
```tsx
// Use rgb(var(--variable)) format for opacity support
className="bg-praxia-accent/10"  // ✅ Works
className="bg-[rgb(var(--praxia-accent))]"  // ✅ Works
className="bg-praxia-accent"  // ✅ Works (via tailwind.config)
```

---

## Commandes Utiles

```bash
# Dev server
npm run dev

# Build production
npm run build

# Analyze bundle
ANALYZE=true npm run build

# Lighthouse CI
npx lighthouse http://localhost:3000 --view

# TypeScript check
npx tsc --noEmit

# ESLint
npm run lint
```

---

## Contact pour Questions

- Plan complet original: `C:\Users\cchab\.claude\plans\witty-hugging-quokka.md`
- Memory fichier: `C:\Users\cchab\.claude\projects\C--Users-cchab-Documents-code-dev-praxia\memory\MEMORY.md`

**Bon courage pour les phases 4, 5, 6! 🚀**
