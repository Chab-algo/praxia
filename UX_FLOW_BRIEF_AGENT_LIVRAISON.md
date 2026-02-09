## Nouveau flow complet "Brief -> Agent -> Livraison"

### Objectif
Creer un parcours unique oriente client qui relie:
1) besoin (Brief), 2) configuration IA (Agent), 3) resultat livrable (Livraison).

### Points d'entree proposes
- Landing CTA "Get Started" -> Brief (nouveau)
- Dashboard Quick Start -> Brief
- CRM lead detail -> "Creer un brief"
- Clients detail -> "Nouveau brief"

### Etapes et ecrans

#### 1) Brief (capture besoin client)
But: cadrer la demande, collecter inputs, clarifier scope.
Ecrans proposes:
- `/dashboard/briefs/new` (wizard 3-4 etapes)
- `/dashboard/briefs/[id]` (resume, documents, validation)
Champs:
- Contexte client, objectif, livrable attendu, format (pdf/csv/text), delai
- Sources de donnees (uploads, URLs, CRM, API)
- Contraintes (langue, ton, budget)
Sortie:
- Brief valide -> creation "Projet" ou "Mission" avec statut.

Mapping existant:
- S'appuie sur recipes + agents (pas encore exposes comme "brief").

#### 2) Agent (design + generation)
But: transformer le brief en recette/agent.
Ecrans proposes:
- `/dashboard/briefs/[id]/agent` (assistant IA + selection recipe)
Actions:
- Recommander 1-3 recipes selon brief
- Creer recipe custom (assistant IA) si besoin
- Parametrer input schema (auto via brief)
Mapping existant:
- `recipes/builder` pour generation + `recipes/[slug]` pour details
- `agents` pour creation et statut

#### 3) Validation (pre-execution)
But: verifier cout, donnees, resultat attendu.
Ecrans proposes:
- `/dashboard/briefs/[id]/validate`
Elements:
- Estimation cout/temps
- Champs requis manquants
- Preview output schema
Mapping existant:
- `recipe detail` + `agent test` (besoin d'un ecran unifie)

#### 4) Execution (run)
But: lancer et suivre.
Ecrans proposes:
- `/dashboard/briefs/[id]/run`
Elements:
- Progress bar, etapes, logs, erreurs
- Retry et variant runs
Mapping existant:
- `executions` (liste) + `agent detail` (test)

#### 5) Livraison (resultat partageable)
But: livrer et archiver.
Ecrans proposes:
- `/dashboard/briefs/[id]/delivery`
Elements:
- Resultat rendu (tableau / doc / rapport)
- Telechargement / partage lien
- Resume des executions + cout final
Mapping existant:
- `executions` pour data brute, a transformer en vue livrable

### Journeys types
1) Landing -> Brief -> Agent -> Livraison
2) CRM lead -> Brief -> Agent -> Livraison -> CRM update
3) Dashboard -> Brief -> Agent -> Livraison -> Analytics

### Impacts navigation
- Ajouter un entree "Briefs" dans la sidebar dashboard.
- Ajouter des CTA contextuels "Creer brief" sur dashboard, CRM lead detail, clients detail.

### Donnees et etats a gerer
- Brief status: draft -> validated -> in_progress -> delivered
- Agent status: draft -> active -> paused
- Execution status: pending -> running -> completed -> failed
Ces statuts doivent etre visibles et coherents dans le flow.
