from app.orchestrator.prompt_builder import PromptBuilder


def test_render_simple_variables():
    builder = PromptBuilder()
    result = builder.render_template("Hello {{name}}", {"name": "World"})
    assert result == "Hello World"


def test_render_nested_variables():
    builder = PromptBuilder()
    variables = {
        "steps": {
            "step1": {
                "output": {
                    "sentiment": "positive"
                }
            }
        }
    }
    result = builder.render_template(
        "The sentiment is {{steps.step1.output.sentiment}}", variables
    )
    assert result == "The sentiment is positive"


def test_render_missing_variable():
    builder = PromptBuilder()
    result = builder.render_template("Hello {{missing}}", {})
    assert result == "Hello {{missing}}"


def test_build_messages():
    builder = PromptBuilder()
    messages = builder.build_messages(
        system_prompt="You are a {{role}}",
        user_prompt="Analyze: {{text}}",
        variables={"role": "classifier", "text": "Great product!"},
    )
    assert len(messages) == 2
    assert messages[0]["role"] == "system"
    assert messages[0]["content"] == "You are a classifier"
    assert messages[1]["role"] == "user"
    assert messages[1]["content"] == "Analyze: Great product!"
