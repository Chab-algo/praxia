from app.orchestrator.router_model import ModelRouter


def test_classify_routes_to_nano():
    router = ModelRouter()
    model = router.select(complexity="classify", org_plan="pro")
    assert model == "gpt-4.1-nano"


def test_generate_routes_to_mini():
    router = ModelRouter()
    model = router.select(complexity="generate_short", org_plan="pro")
    assert model == "gpt-4.1-mini"


def test_reason_routes_to_full():
    router = ModelRouter()
    model = router.select(complexity="reason", org_plan="pro")
    assert model == "gpt-4.1"


def test_trial_plan_forces_nano():
    router = ModelRouter()
    model = router.select(complexity="reason", org_plan="trial")
    assert model == "gpt-4.1-nano"


def test_starter_plan_allows_mini():
    router = ModelRouter()
    model = router.select(complexity="generate_short", org_plan="starter")
    assert model == "gpt-4.1-mini"


def test_starter_plan_downgrades_full_to_mini():
    router = ModelRouter()
    model = router.select(complexity="reason", org_plan="starter")
    assert model == "gpt-4.1-mini"


def test_force_model_overrides():
    router = ModelRouter()
    model = router.select(
        complexity="classify", org_plan="trial", force_model="gpt-4.1"
    )
    assert model == "gpt-4.1"


def test_long_input_downgrades_full():
    router = ModelRouter()
    model = router.select(complexity="reason", org_plan="pro", input_tokens=5000)
    assert model == "gpt-4.1-mini"
