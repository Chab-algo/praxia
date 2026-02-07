const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// Recipes
export async function listRecipes() {
  return fetchAPI("/api/recipes");
}

export async function getRecipe(slug: string) {
  return fetchAPI(`/api/recipes/${slug}`);
}

// Agents
export async function listAgents(token: string) {
  return fetchAPI("/api/agents", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAgent(token: string, data: {
  name: string;
  recipe_slug: string;
  description?: string;
}) {
  return fetchAPI("/api/agents", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Executions
export async function createExecution(token: string, data: {
  agent_id: string;
  input_data: Record<string, unknown>;
}) {
  return fetchAPI("/api/executions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function listExecutions(token: string) {
  return fetchAPI("/api/executions", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getExecution(token: string, id: string) {
  return fetchAPI(`/api/executions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Usage
export async function getBudgetStatus(token: string) {
  return fetchAPI("/api/usage/budget", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Analytics
export async function getAnalyticsOverview(token: string) {
  return fetchAPI("/api/analytics/overview", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAnalyticsAgents(token: string) {
  return fetchAPI("/api/analytics/agents", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAnalyticsTimeline(token: string, days: number = 30) {
  return fetchAPI(`/api/analytics/timeline?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
