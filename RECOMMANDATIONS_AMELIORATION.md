# Recommandations concrètes d'amélioration

## 🎯 Priorité 1 : Builder de Recipes pour Product Designers

### Problème actuel
Les clients doivent choisir parmi des recipes prédéfinies. Ils ne peuvent pas modéliser leurs besoins métiers spécifiques.

### Solution : Recipe Builder visuel avec Assistant IA

#### 1. Backend - API de création dynamique de recipes

**Nouveau fichier** : `backend/app/recipes/builder.py`

```python
from typing import Optional
import structlog
from app.recipes.registry import get_recipe, list_recipes
from app.llm.assistant import RecipeAssistant  # À créer

logger = structlog.get_logger()

class RecipeBuilder:
    """Aide à créer des recipes à partir de besoins métiers."""
    
    async def generate_from_requirement(
        self,
        business_need: str,
        domain: str,
        examples: Optional[list[dict]] = None
    ) -> dict:
        """
        Génère une recipe à partir d'un besoin métier décrit en langage naturel.
        
        Exemple:
        business_need = "Je veux un agent qui analyse les avis clients 
                        et génère des réponses personnalisées selon le sentiment"
        """
        assistant = RecipeAssistant()
        recipe = await assistant.generate_recipe(
            requirement=business_need,
            domain=domain,
            examples=examples
        )
        return recipe
    
    async def suggest_improvements(
        self,
        recipe_slug: str,
        execution_results: list[dict]
    ) -> list[str]:
        """Suggère des améliorations basées sur les résultats d'exécution."""
        # Analyse les résultats et suggère des optimisations
        pass
```

**Nouveau fichier** : `backend/app/llm/assistant.py`

```python
from app.orchestrator.llm_client import LLMClient

class RecipeAssistant:
    """Assistant IA pour créer des recipes."""
    
    async def generate_recipe(
        self,
        requirement: str,
        domain: str,
        examples: Optional[list] = None
    ) -> dict:
        """
        Utilise un LLM pour générer une recipe complète à partir d'un besoin.
        """
        prompt = f"""
        Tu es un expert en création d'agents IA. Crée une recipe YAML complète
        pour répondre à ce besoin métier :
        
        "{requirement}"
        
        Domaine : {domain}
        
        La recipe doit inclure :
        - slug, name, description, category
        - input_schema (JSON Schema)
        - output_schema (JSON Schema)
        - steps (workflow avec prompts optimisés)
        - roi_metrics
        
        Réponds uniquement avec le YAML valide, sans explications.
        """
        
        # Utiliser LLMClient pour générer
        # Parser et valider le YAML
        # Retourner la recipe structurée
        pass
```

**Modifier** : `backend/app/recipes/router.py`

```python
@router.post("/builder/generate", response_model=dict)
async def generate_recipe_from_requirement(
    body: RecipeGenerationRequest,
    user: Annotated[User, Depends(get_current_user)],
):
    """Génère une recipe à partir d'un besoin métier."""
    builder = RecipeBuilder()
    recipe = await builder.generate_from_requirement(
        business_need=body.requirement,
        domain=body.domain,
        examples=body.examples
    )
    return recipe

@router.post("/builder/validate", response_model=dict)
async def validate_recipe(
    body: dict,  # Recipe YAML
    user: Annotated[User, Depends(get_current_user)],
):
    """Valide une recipe avant de la sauvegarder."""
    # Validation de schéma
    # Vérification de syntaxe
    # Suggestions d'amélioration
    pass
```

#### 2. Frontend - Interface de création visuelle

**Nouveau fichier** : `frontend/src/app/dashboard/recipes/builder/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function RecipeBuilderPage() {
  const { getToken } = useAuth();
  const [mode, setMode] = useState<"assistant" | "visual">("assistant");
  const [requirement, setRequirement] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/recipes/builder/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirement,
          domain: "ecommerce", // À récupérer depuis un select
        }),
      });
      const recipe = await response.json();
      setGeneratedRecipe(recipe);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Créer une Recipe</h1>
      
      {/* Mode Assistant IA */}
      {mode === "assistant" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Décrivez votre besoin métier
            </label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Ex: Je veux un agent qui analyse les avis clients et génère des réponses personnalisées selon le sentiment..."
              className="w-full p-3 border rounded-lg"
              rows={5}
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !requirement.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Génération..." : "Générer la Recipe"}
          </button>
          
          {generatedRecipe && (
            <RecipePreview recipe={generatedRecipe} />
          )}
        </div>
      )}
      
      {/* Mode Éditeur Visuel */}
      {mode === "visual" && (
        <VisualRecipeEditor />
      )}
    </div>
  );
}
```

**Nouveau composant** : `frontend/src/components/RecipeVisualEditor.tsx`

```tsx
// Éditeur drag-and-drop pour créer des workflows visuellement
// Utiliser react-flow ou similar
```

---

## 🎯 Priorité 2 : Module CRM

### 1. Backend - Modèles CRM

**Nouveau fichier** : `backend/app/crm/models.py`

```python
from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum
from app.db.base import Base, UUIDMixin, TimestampMixin

class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class Lead(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "leads"
    
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id"), nullable=False
    )
    
    # Informations contact
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255))
    company: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    
    # Statut et suivi
    status: Mapped[LeadStatus] = mapped_column(
        SQLEnum(LeadStatus), default=LeadStatus.NEW
    )
    source: Mapped[str | None] = mapped_column(String(100))  # website, referral, etc.
    score: Mapped[int] = mapped_column(Integer, default=0)
    
    # Métadonnées
    notes: Mapped[str | None] = mapped_column(Text)
    metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    
    # Relations
    interactions: Mapped[list["LeadInteraction"]] = relationship()
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))

class LeadInteraction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "lead_interactions"
    
    lead_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("leads.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    
    type: Mapped[str] = mapped_column(String(50))  # email, call, meeting, demo
    subject: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)
    outcome: Mapped[str | None] = mapped_column(String(100))
```

**Nouveau fichier** : `backend/app/crm/router.py`

```python
from fastapi import APIRouter, Depends
from app.crm import service
from app.crm.schemas import LeadCreate, LeadResponse, LeadUpdate

router = APIRouter(prefix="/api/crm", tags=["crm"])

@router.post("/leads", response_model=LeadResponse)
async def create_lead(
    body: LeadCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Créer un nouveau lead."""
    return await service.create_lead(db, user, body)

@router.get("/leads", response_model=list[LeadResponse])
async def list_leads(
    status: Optional[str] = None,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Lister les leads."""
    return await service.list_leads(db, user, status)

@router.post("/leads/{lead_id}/interactions")
async def add_interaction(
    lead_id: uuid.UUID,
    body: InteractionCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Ajouter une interaction avec un lead."""
    return await service.add_interaction(db, lead_id, user.id, body)
```

### 2. Frontend - Interface CRM

**Nouveau fichier** : `frontend/src/app/crm/leads/page.tsx`

```tsx
"use client";

export default function LeadsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pipeline de Vente</h1>
      
      {/* Kanban board avec les différents statuts */}
      <div className="grid grid-cols-6 gap-4">
        {Object.values(LeadStatus).map((status) => (
          <LeadColumn key={status} status={status} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Priorité 3 : Vue Client 360°

### Backend - API Vue Client

**Nouveau fichier** : `backend/app/clients/router.py`

```python
@router.get("/clients/{client_id}/overview")
async def get_client_overview(
    client_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Vue complète d'un client."""
    org = await db.get(Organization, client_id)
    
    # Récupérer toutes les données
    agents = await db.execute(
        select(Agent).where(Agent.organization_id == client_id)
    )
    executions = await db.execute(
        select(Execution).where(Execution.organization_id == client_id)
    )
    usage = await get_usage_stats(db, client_id)
    
    return {
        "organization": org,
        "agents": agents.scalars().all(),
        "executions_count": executions.rowcount,
        "usage_stats": usage,
        "health_score": calculate_health_score(org, agents, executions),
    }
```

### Frontend - Dashboard Client

**Nouveau fichier** : `frontend/src/app/clients/[id]/page.tsx`

```tsx
export default function ClientDashboardPage({ params }: { params: { id: string } }) {
  // Vue complète du client :
  // - Agents créés
  // - Utilisation et coûts
  // - Métriques d'adoption
  // - Support tickets
  // - Feedback
}
```

---

## 🎯 Priorité 4 : Support Multimédia

### Modifications dans l'orchestrator

**Modifier** : `backend/app/orchestrator/engine.py`

```python
async def _execute_llm_step(
    self,
    step: dict,
    variables: dict,
    org_id: str,
    org_plan: str,
    recipe_id: str | None,
    result: ExecutionResult,
    step_result: dict,
) -> dict:
    """Execute an LLM step, with support for multimodal inputs."""
    
    # Détecter le type d'input
    input_data = step.get("input_data", {})
    
    # Si image dans l'input
    if "image" in input_data or step.get("vision", False):
        # Utiliser modèle vision (GPT-4 Vision, Claude 3, etc.)
        return await self._execute_vision_step(...)
    
    # Si audio dans l'input
    if "audio" in input_data:
        # Transcrire d'abord, puis traiter
        transcript = await self._transcribe_audio(input_data["audio"])
        variables["transcript"] = transcript
        return await self._execute_llm_step(...)
    
    # Traitement texte classique
    return await self._execute_text_llm_step(...)
```

**Nouveau fichier** : `backend/app/recipes/templates/image_product_analyzer.yml`

```yaml
slug: image-product-analyzer
name: Image Product Analyzer
description: "Analyse des images de produits pour générer des descriptions et tags"
category: ecommerce

input_schema:
  type: object
  required:
    - product_image
  properties:
    product_image:
      type: string
      format: base64_image
      description: "Image du produit en base64"
    language:
      type: string
      enum: [fr, en]
      default: fr

output_schema:
  type: object
  properties:
    description:
      type: string
    tags:
      type: array
      items:
        type: string
    category:
      type: string
    price_estimate:
      type: number

steps:
  - id: analyze_image
    name: "Analyze Product Image"
    type: llm_call
    vision: true  # Nouveau flag
    complexity: analyze
    system_prompt: |
      Tu es un expert en e-commerce. Analyse cette image de produit et génère
      une description détaillée, des tags pertinents, et une estimation de catégorie.
    user_prompt: "Image: {{product_image}}"
    max_tokens: 500
```

---

## 📊 Métriques à ajouter

### Backend - Analytics avancés

**Nouveau fichier** : `backend/app/analytics/service.py`

```python
async def get_client_health_score(
    db: AsyncSession,
    org_id: uuid.UUID
) -> dict:
    """Calcule un score de santé pour un client."""
    
    # Facteurs :
    # - Nombre d'agents actifs
    # - Fréquence d'utilisation
    # - Taux de succès des exécutions
    # - Engagement (dernière utilisation)
    # - Feedback positif
    
    return {
        "score": 85,  # 0-100
        "factors": {
            "adoption": 90,
            "usage": 80,
            "satisfaction": 85,
        },
        "recommendations": [
            "Créer plus d'agents pour automatiser d'autres processus",
            "Optimiser les prompts pour réduire les coûts",
        ]
    }
```

---

## 🔄 Workflow business automatisé

### Backend - Automatisations

**Nouveau fichier** : `backend/app/workflows/automations.py`

```python
class BusinessWorkflow:
    """Automatise le cycle de vente et la gestion clients."""
    
    async def on_lead_created(self, lead_id: uuid.UUID):
        """Quand un lead est créé."""
        # Envoyer email de bienvenue
        # Assigner à un commercial
        # Créer une tâche de suivi
        
    async def on_client_onboarded(self, org_id: uuid.UUID):
        """Quand un client termine l'onboarding."""
        # Envoyer ressources
        # Programmer un check-in dans 7 jours
        # Créer un agent de démo
        
    async def check_client_health(self, org_id: uuid.UUID):
        """Vérifie la santé d'un client."""
        health = await get_client_health_score(org_id)
        if health["score"] < 50:
            # Alerter l'équipe
            # Envoyer un email au client
            # Proposer un call
```

---

## 📝 Checklist d'implémentation

### Phase 1 (Critique - 1-2 mois)
- [ ] Recipe Builder avec Assistant IA
- [ ] API de génération de recipes
- [ ] Interface visuelle de création
- [ ] Module CRM basique (leads, pipeline)
- [ ] Vue client 360°

### Phase 2 (Important - 2-3 mois)
- [ ] Support vision (images)
- [ ] Support audio (transcription)
- [ ] Support documents (PDF)
- [ ] Dashboard analytics avancé
- [ ] Système de support client

### Phase 3 (Amélioration - 3-4 mois)
- [ ] Recommandations automatiques
- [ ] Optimisation automatique
- [ ] Workflow business complet
- [ ] Gestion contrats/facturation
- [ ] Veille technologique

---

## 🎯 Conclusion

Ces améliorations transformeront votre plateforme d'un **outil technique** en une **solution business complète** alignée avec votre mission :

1. ✅ Product designers peuvent créer leurs agents
2. ✅ Cycle de vente géré de A à Z
3. ✅ Clients suivis et supportés
4. ✅ Multimédia supporté
5. ✅ Amélioration continue automatisée
