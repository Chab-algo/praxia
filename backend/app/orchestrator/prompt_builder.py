import re


class PromptBuilder:
    """Builds optimized prompts from recipe step templates."""

    @staticmethod
    def render_template(template: str, variables: dict) -> str:
        """Replace {{variable}} placeholders with actual values.

        Supports nested access like {{steps.classify_sentiment.output.sentiment}}.
        """

        def replacer(match: re.Match) -> str:
            path = match.group(1).strip()
            parts = path.split(".")
            value = variables
            for part in parts:
                if isinstance(value, dict):
                    value = value.get(part, f"{{{{{path}}}}}")
                else:
                    return f"{{{{{path}}}}}"
            return str(value) if not isinstance(value, (dict, list)) else str(value)

        return re.sub(r"\{\{(.+?)\}\}", replacer, template)

    def build_messages(
        self,
        system_prompt: str,
        user_prompt: str,
        variables: dict,
    ) -> list[dict]:
        """Build the messages array for an LLM call."""
        rendered_system = self.render_template(system_prompt, variables)
        rendered_user = self.render_template(user_prompt, variables)

        return [
            {"role": "system", "content": rendered_system},
            {"role": "user", "content": rendered_user},
        ]


# Singleton
prompt_builder = PromptBuilder()
