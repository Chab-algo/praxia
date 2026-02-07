import re
import uuid
from typing import Optional

import structlog
import yaml

from app.orchestrator.llm_client import get_llm_client

logger = structlog.get_logger()

# Domain templates for better recipe generation
DOMAIN_TEMPLATES = {
    "ecommerce": {
        "common_inputs": ["product_name", "product_description", "price", "category"],
        "common_outputs": ["analysis", "recommendations", "tags"],
        "examples": [
            "Analyze product reviews and generate responses",
            "Generate product descriptions from images",
            "Classify customer inquiries by intent",
        ],
    },
    "hr": {
        "common_inputs": ["resume_text", "job_description", "candidate_name"],
        "common_outputs": ["match_score", "skills", "recommendations"],
        "examples": [
            "Screen CVs and rank candidates",
            "Generate job descriptions from requirements",
            "Analyze employee feedback sentiment",
        ],
    },
    "finance": {
        "common_inputs": ["transaction_data", "invoice_text", "amount"],
        "common_outputs": ["category", "risk_score", "summary"],
        "examples": [
            "Extract data from invoices",
            "Classify transactions by category",
            "Analyze financial documents",
        ],
    },
    "marketing": {
        "common_inputs": ["content", "target_audience", "platform"],
        "common_outputs": ["post_text", "hashtags", "cta"],
        "examples": [
            "Generate social media posts",
            "Create email campaign content",
            "Analyze campaign performance",
        ],
    },
    "support": {
        "common_inputs": ["ticket_text", "customer_tier", "product_name"],
        "common_outputs": ["priority", "category", "response"],
        "examples": [
            "Classify support tickets",
            "Generate automated responses",
            "Route tickets to correct team",
        ],
    },
}


class RecipeAssistant:
    """Assistant IA pour créer des recipes à partir de besoins métiers."""

    def __init__(self):
        self.llm_client = get_llm_client()

    async def generate_recipe(
        self,
        requirement: str,
        domain: str = "general",
        examples: Optional[list[dict]] = None,
    ) -> dict:
        """
        Génère une recipe complète à partir d'un besoin métier décrit en langage naturel.

        Args:
            requirement: Description du besoin métier (ex: "Je veux un agent qui analyse les avis clients")
            domain: Domaine métier (ecommerce, hr, finance, marketing, support)
            examples: Exemples optionnels de données d'entrée/sortie

        Returns:
            dict: Recipe complète au format YAML (dictionnaire Python)
        """
        logger.info("recipe_generation_start", requirement=requirement, domain=domain)

        # Build context from domain templates
        domain_info = DOMAIN_TEMPLATES.get(domain, {})
        domain_context = self._build_domain_context(domain, domain_info)

        # Build prompt for LLM
        prompt = self._build_generation_prompt(requirement, domain, domain_context, examples)

        # Call LLM
        messages = [
            {
                "role": "system",
                "content": "Tu es un expert en création d'agents IA. Tu génères des recipes YAML complètes et valides pour des workflows d'automatisation métier.",
            },
            {"role": "user", "content": prompt},
        ]

        try:
            response = await self.llm_client.complete(
                model="gpt-4.1-mini",  # Use mini for cost efficiency
                messages=messages,
                max_tokens=2000,
                temperature=0.3,
            )

            # Extract YAML from response
            recipe_dict = self._parse_llm_response(response.content)

            # Validate and enhance recipe
            recipe_dict = self._validate_and_enhance_recipe(recipe_dict, requirement, domain)

            logger.info("recipe_generation_success", slug=recipe_dict.get("slug"))
            return recipe_dict

        except Exception as e:
            logger.error("recipe_generation_failed", error=str(e))
            raise ValueError(f"Erreur lors de la génération de la recipe: {str(e)}")

    def _build_domain_context(self, domain: str, domain_info: dict) -> str:
        """Construit le contexte du domaine pour aider le LLM."""
        context = f"Domaine métier: {domain}\n\n"
        
        if domain_info.get("common_inputs"):
            context += f"Inputs communs dans ce domaine: {', '.join(domain_info['common_inputs'])}\n"
        
        if domain_info.get("common_outputs"):
            context += f"Outputs communs dans ce domaine: {', '.join(domain_info['common_outputs'])}\n"
        
        if domain_info.get("examples"):
            context += "\nExemples de besoins similaires:\n"
            for ex in domain_info["examples"]:
                context += f"- {ex}\n"
        
        return context

    def _build_generation_prompt(
        self,
        requirement: str,
        domain: str,
        domain_context: str,
        examples: Optional[list[dict]],
    ) -> str:
        """Construit le prompt pour le LLM."""
        
        # Load example recipe for reference
        example_recipe = self._get_example_recipe_for_domain(domain)
        
        prompt = f"""Crée une recipe YAML complète pour répondre à ce besoin métier:

"{requirement}"

{domain_context}

La recipe doit suivre exactement ce format YAML (utilise cet exemple comme référence):

```yaml
{example_recipe}
```

Instructions importantes:
1. Génère un slug unique et descriptif (format: kebab-case)
2. Crée un input_schema JSON Schema avec les propriétés nécessaires
3. Crée un output_schema JSON Schema avec les propriétés de sortie attendues
4. Définis des steps logiques (au moins 2-3 steps):
   - Utilise "llm_call" pour les appels LLM
   - Utilise "transform" pour formater les outputs
   - Chaque step doit avoir: id, name, type, et les propriétés appropriées
5. Ajoute des prompts système et utilisateur pertinents pour chaque step LLM
6. Utilise des complexities appropriées: classify, extract, generate_short, generate_long, analyze
7. Ajoute estimated_cost_per_run (estimation en USD, ex: 0.0004)
8. Ajoute roi_metrics avec time_saved et use_case

Réponds UNIQUEMENT avec le YAML valide, sans explications supplémentaires, sans markdown code blocks."""

        if examples:
            prompt += f"\n\nExemples de données fournis:\n{yaml.dump(examples)}"

        return prompt

    def _get_example_recipe_for_domain(self, domain: str) -> str:
        """Récupère un exemple de recipe pour le domaine."""
        from app.recipes import registry
        
        # Try to find a recipe in the same domain
        recipes = registry.list_recipes()
        for recipe in recipes:
            if recipe.get("category") == domain:
                full_recipe = registry.get_recipe(recipe["slug"])
                if full_recipe:
                    return yaml.dump(full_recipe, allow_unicode=True, default_flow_style=False)
        
        # Fallback to support ticket classifier
        fallback = registry.get_recipe("support-ticket-classifier")
        if fallback:
            return yaml.dump(fallback, allow_unicode=True, default_flow_style=False)
        
        return ""

    def _parse_llm_response(self, content: str) -> dict:
        """Parse la réponse du LLM pour extraire le YAML."""
        # Remove markdown code blocks if present
        content = re.sub(r"```yaml\n?", "", content)
        content = re.sub(r"```\n?", "", content)
        content = content.strip()

        try:
            recipe_dict = yaml.safe_load(content)
            if not isinstance(recipe_dict, dict):
                raise ValueError("La réponse n'est pas un dictionnaire valide")
            return recipe_dict
        except yaml.YAMLError as e:
            logger.error("yaml_parse_error", error=str(e), content=content[:200])
            raise ValueError(f"Erreur de parsing YAML: {str(e)}")

    def _validate_and_enhance_recipe(self, recipe_dict: dict, requirement: str, domain: str) -> dict:
        """Valide et améliore la recipe générée."""
        # Ensure required fields
        if "slug" not in recipe_dict:
            # Generate slug from requirement
            slug_base = re.sub(r"[^a-z0-9]+", "-", requirement.lower())[:50]
            recipe_dict["slug"] = f"{slug_base}-{str(uuid.uuid4())[:8]}"

        if "name" not in recipe_dict:
            recipe_dict["name"] = requirement[:100]

        if "description" not in recipe_dict:
            recipe_dict["description"] = requirement

        if "category" not in recipe_dict:
            recipe_dict["category"] = domain

        if "version" not in recipe_dict:
            recipe_dict["version"] = "1.0.0"

        # Ensure schemas exist
        if "input_schema" not in recipe_dict:
            recipe_dict["input_schema"] = {
                "type": "object",
                "properties": {},
            }

        if "output_schema" not in recipe_dict:
            recipe_dict["output_schema"] = {
                "type": "object",
                "properties": {},
            }

        # Ensure steps exist
        if "steps" not in recipe_dict or not recipe_dict["steps"]:
            # Add a basic step
            recipe_dict["steps"] = [
                {
                    "id": "process",
                    "name": "Process",
                    "type": "llm_call",
                    "complexity": "generate_short",
                    "system_prompt": f"Tu es un assistant expert. {requirement}",
                    "user_prompt": "{{input_data}}",
                    "max_tokens": 500,
                    "temperature": 0.3,
                }
            ]

        # Ensure estimated_cost_per_run
        if "estimated_cost_per_run" not in recipe_dict:
            recipe_dict["estimated_cost_per_run"] = 0.0005  # Default estimate

        # Ensure roi_metrics
        if "roi_metrics" not in recipe_dict:
            recipe_dict["roi_metrics"] = {
                "time_saved": "TBD",
                "use_case": requirement,
            }

        return recipe_dict
