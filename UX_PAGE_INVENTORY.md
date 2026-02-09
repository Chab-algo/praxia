## Inventaire des pages (regroupe par objectifs UX)

### Acquisition et conversion
- `/` landing page (marketing, proof, CTA)
  - `frontend/src/app/page.tsx`
  - `frontend/src/app/components/landing/*`

### Authentification
- `/sign-in`
  - `frontend/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `/sign-up`
  - `frontend/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

### Activation / onboarding
- `/dashboard/onboarding` (multi-steps: welcome -> recipe -> agent -> test -> success)
  - `frontend/src/app/dashboard/onboarding/page.tsx`

### Creation d'agent (templates + builder)
- `/dashboard/recipes` (catalog + mes recipes)
  - `frontend/src/app/dashboard/recipes/page.tsx`
- `/dashboard/recipes/[slug]` (detail recipe + create agent)
  - `frontend/src/app/dashboard/recipes/[slug]/page.tsx`
- `/dashboard/recipes/builder` (assistant IA + editeur visuel)
  - `frontend/src/app/dashboard/recipes/builder/page.tsx`

### Gestion des agents
- `/dashboard/agents` (liste agents)
  - `frontend/src/app/dashboard/agents/page.tsx`
- `/dashboard/agents/[id]` (detail agent + test)
  - `frontend/src/app/dashboard/agents/[id]/page.tsx`

### Execution et resultats
- `/dashboard/executions` (liste executions + details expand)
  - `frontend/src/app/dashboard/executions/page.tsx`

### Pilotage et performance
- `/dashboard` (overview + quick start)
  - `frontend/src/app/dashboard/page.tsx`
- `/dashboard/usage` (budget, pricing)
  - `frontend/src/app/dashboard/usage/page.tsx`
- `/dashboard/analytics` (KPI + charts + insights)
  - `frontend/src/app/dashboard/analytics/page.tsx`

### CRM
- `/crm/leads` (pipeline kanban)
  - `frontend/src/app/crm/leads/page.tsx`
- `/crm/leads/[id]` (detail lead + interactions)
  - `frontend/src/app/crm/leads/[id]/page.tsx`
- `/crm/leads/new` (creation lead)
  - `frontend/src/app/crm/leads/new/page.tsx`

### Clients (CSP / account health)
- `/clients` (placeholder)
  - `frontend/src/app/clients/page.tsx`
- `/clients/[id]` (overview client)
  - `frontend/src/app/clients/[id]/page.tsx`

### Systeme et layout
- Layout dashboard (navigation principale, header)
  - `frontend/src/app/dashboard/layout.tsx`
- Layout CRM (navigation)
  - `frontend/src/app/crm/layout.tsx`
- Pages d'erreur
  - `frontend/src/app/dashboard/error.tsx`
  - `frontend/src/app/global-error.tsx`
