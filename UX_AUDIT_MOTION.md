## Audit UX page par page (focus motion + micro-interactions)

### Observations transverses (tout le produit)
- Navigation: pas d'etat actif dans la sidebar dashboard (sauf CRM) et pas de feedback sur la page courante.
- Langue: mix FR/EN (CTA, labels, erreurs) cree une friction de comprehension.
- Loading: usage majoritaire de spinners; peu de skeletons, pas d'etats progressifs.
- Empty states: plusieurs pages affichent un texte minimal, sans guidance claire sur la prochaine action.
- Motion: Framer Motion present mais utilise surtout sur la landing; pas de systeme global.
- Accessibilite: peu d'indications focus visuel, absence de prefer-reduced-motion.

### Landing (`/`)
But: conversion vers signup/signin.
Friction:
- Nav mobile ok mais pas de focus states pour clavier.
- CTA "Get Started" renvoie a ancre, pas a un flow de brief.
Motion opportunities:
- Hero et sections: reveal progressif, micro-parallax leger.
- CTA: hover/press states coherents, feedback click.

### Auth (`/sign-in`, `/sign-up`)
But: authentifier sans friction.
Friction:
- Pas de copy oriente benefice (value proposition).
- Pas de feedback de progression si latence.
Motion:
- Transition entree (fade + slide) et micro-feedback sur erreurs.

### Dashboard overview (`/dashboard`)
But: vue rapide + raccourcis.
Friction:
- Cards stats uniquement lien, pas d'indication de priorite.
- Quick Start liste 3 actions mais pas de chemin complet.
Motion:
- Skeleton deja utilise; ajouter transition cards (hover elevation) et apparition progressive.

### Onboarding (`/dashboard/onboarding`)
But: creer 1er agent rapidement.
Friction:
- Steps longs, pas de resume final "ce qui sera cree".
- Step 2 propose builder/recipe mais pas de guidance "commencez par".
- Message d'erreur non contextualise (global).
Motion:
- Progress bar animee avec transition entre steps.
- Etat "creation/test" -> progress (bar + steps) plutot qu'un simple spinner.

### Recipes list (`/dashboard/recipes`)
But: choisir recette ou creer.
Friction:
- Filtre categorie uniquement texte; pas de resultat count par filtre.
- Tab "Mes recipes" vide peu actionnable (un seul CTA).
Motion:
- Filtre: animation de selection (pill scale/fade).
- Cards: hover elevation + gradient border discret.

### Recipe detail (`/dashboard/recipes/[slug]`)
But: comprendre et creer agent.
Friction:
- Informations d'entree/steps tres denses, pas de resume "input -> output".
- CTA "Create Agent" sans estimation de temps/cout.
Motion:
- Sections accordion (Input/Workflow/ROI) avec transitions.
- Previsualisation du workflow (stepper) avec micro-progress.

### Recipe builder (`/dashboard/recipes/builder`)
But: creer recette perso.
Friction:
- Assistant IA: validation/erreur empilee, manque d'ordre.
- Visual editor: flux longs, pas de guide "first action".
Motion:
- Generation IA: animation d'etat (progress, timeline).
- Visual editor: selection nodes avec highlight + outline motion.

### Agents list (`/dashboard/agents`)
But: retrouver, gerer agents.
Friction:
- Liste sans filtre/recherche.
- Status uniquement badge; pas d'action rapide.
Motion:
- Cards: hover + focus; reveal par batch.
- Empty state: micro-animation et CTA principal.

### Agent detail (`/dashboard/agents/[id]`)
But: tester agent et voir resultats.
Friction:
- Formulaire long, sans regroupement par sections.
- Resultat JSON brut, pas de rendu lisible.
Motion:
- Execution: bouton avec progress + timeline de steps.
- Resultat: reveal + highlight de sections modifiees.

### Executions (`/dashboard/executions`)
But: inspection executions.
Friction:
- Liste dense; expand/collapse non signale.
- Output/error tres long sans gestion du scroll.
Motion:
- Expand avec height animation.
- Status badge pulse si "running".

### Usage (`/dashboard/usage`)
But: suivi budget.
Friction:
- Graphique seulement barre; pas de notion temporelle.
- Message d'erreur "Redis" technique.
Motion:
- Barre budget: animate width + threshold color transitions.
- Micro-interaction sur pricing rows (hover details).

### Analytics (`/dashboard/analytics`)
But: performance globale.
Friction:
- Tableau dense, sans tri ni highlights.
- Insights bloque en haut mais pas actions directes.
Motion:
- Charts: animate stroke sur charge.
- KPI cards: counter animation (optional, prefer reduced motion).

### CRM - Leads (`/crm/leads`)
But: pipeline commercial.
Friction:
- Drag/drop sans feedback visuel cible.
- Pas de quick actions (call/email).
Motion:
- Drag target: highlight et placeholder.
- Card drag ghost + drop confirmation.

### CRM - Lead detail (`/crm/leads/[id]`)
But: suivre relation lead.
Friction:
- Timeline interactions sans grouping ni status.
- Form add interaction inline mais sans progression.
Motion:
- Expand/collapse add interaction.
- Timeline item reveal (stagger).

### CRM - New lead (`/crm/leads/new`)
But: creation lead.
Friction:
- Long form sans stepper, pas de validation temps reel.
Motion:
- Focus/field validation micro-feedback (shake, color).
- Submit progress.

### Clients (`/clients`, `/clients/[id]`)
But: health account (placeholder).
Friction:
- Liste clients vide, pas d'explication roadmap.
- Detail client dense mais sans highlights.
Motion:
- Score health: animate count + ring progress.
- Recommendations: expand/collapse.
