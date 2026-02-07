import re
import structlog
from typing import Optional

from app.llm.assistant import RecipeAssistant
from app.recipes import registry

logger = structlog.get_logger()


class RecipeBuilder:
    """Aide à créer des recipes à partir de besoins métiers."""

    def __init__(self):
        self.assistant = RecipeAssistant()

    async def generate_from_requirement(
        self,
        business_need: str,
        domain: str = "general",
        examples: Optional[list[dict]] = None,
    ) -> dict:
        """
        Génère une recipe à partir d'un besoin métier décrit en langage naturel.

        Args:
            business_need: Description du besoin métier
            domain: Domaine métier (ecommerce, hr, finance, marketing, support)
            examples: Exemples optionnels de données

        Returns:
            dict: Recipe complète

        Example:
            >>> builder = RecipeBuilder()
            >>> recipe = await builder.generate_from_requirement(
            ...     "Je veux un agent qui analyse les avis clients et génère des réponses personnalisées",
            ...     domain="ecommerce"
            ... )
        """
        logger.info(
            "recipe_builder_generate",
            business_need=business_need[:100],
            domain=domain,
        )

        recipe = await self.assistant.generate_recipe(
            requirement=business_need,
            domain=domain,
            examples=examples,
        )

        return recipe

    async def suggest_improvements(
        self,
        recipe_slug: str,
        execution_results: list[dict],
    ) -> list[str]:
        """
        Suggère des améliorations basées sur les résultats d'exécution.

        Args:
            recipe_slug: Slug de la recipe à améliorer
            execution_results: Liste des résultats d'exécution avec métriques

        Returns:
            list[str]: Liste de suggestions d'amélioration
        """
        recipe = registry.get_recipe(recipe_slug)
        if not recipe:
            return []

        # Analyze execution results
        suggestions = []

        # Check success rate
        if execution_results:
            success_count = sum(1 for r in execution_results if r.get("status") == "completed")
            success_rate = success_count / len(execution_results) if execution_results else 0

            if success_rate < 0.8:
                suggestions.append(
                    "Le taux de succès est faible. Considérez améliorer les prompts ou ajouter des validations."
                )

        # Check costs
        if execution_results:
            avg_cost = sum(r.get("total_cost_cents", 0) for r in execution_results) / len(execution_results)
            if avg_cost > 10:  # More than 10 cents per execution
                suggestions.append(
                    "Les coûts sont élevés. Considérez utiliser des modèles moins coûteux ou optimiser les prompts."
                )

        # Check duration
        if execution_results:
            avg_duration = sum(r.get("duration_ms", 0) for r in execution_results) / len(execution_results)
            if avg_duration > 10000:  # More than 10 seconds
                suggestions.append(
                    "La durée d'exécution est longue. Considérez paralléliser les steps ou utiliser le cache."
                )

        return suggestions

    def validate_recipe(self, recipe_dict: dict) -> dict:
        """
        Valide une recipe et retourne les erreurs/suggestions.

        Args:
            recipe_dict: Recipe à valider

        Returns:
            dict: {
                "valid": bool,
                "errors": list[str],
                "warnings": list[str],
                "suggestions": list[str]
            }
        """
        errors = []
        warnings = []
        suggestions = []

        # Check required fields
        required_fields = ["slug", "name", "category", "input_schema", "output_schema", "steps"]
        for field in required_fields:
            if field not in recipe_dict:
                errors.append(f"Champ requis manquant: {field}")

        # Validate slug format
        if "slug" in recipe_dict:
            slug = recipe_dict["slug"]
            if not re.match(r"^[a-z0-9-]+$", slug):
                errors.append("Le slug doit être en format kebab-case (minuscules, tirets, chiffres)")

        # Validate steps
        if "steps" in recipe_dict:
            steps = recipe_dict["steps"]
            if not isinstance(steps, list) or len(steps) == 0:
                errors.append("La recipe doit avoir au moins un step")

            for i, step in enumerate(steps):
                if "id" not in step:
                    errors.append(f"Step {i}: 'id' manquant")
                if "type" not in step:
                    errors.append(f"Step {i}: 'type' manquant")
                if step.get("type") == "llm_call":
                    if "system_prompt" not in step:
                        warnings.append(f"Step {step.get('id', i)}: 'system_prompt' recommandé pour llm_call")
                    if "complexity" not in step:
                        warnings.append(f"Step {step.get('id', i)}: 'complexity' recommandé pour optimisation")

        # Validate schemas
        if "input_schema" in recipe_dict:
            schema = recipe_dict["input_schema"]
            if schema.get("type") != "object":
                warnings.append("input_schema devrait être de type 'object'")

        if "output_schema" in recipe_dict:
            schema = recipe_dict["output_schema"]
            if schema.get("type") != "object":
                warnings.append("output_schema devrait être de type 'object'")

        # Suggestions
        if "estimated_cost_per_run" not in recipe_dict:
            suggestions.append("Ajouter 'estimated_cost_per_run' pour aider les utilisateurs à estimer les coûts")

        if "roi_metrics" not in recipe_dict:
            suggestions.append("Ajouter 'roi_metrics' pour montrer la valeur métier")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "suggestions": suggestions,
        }
