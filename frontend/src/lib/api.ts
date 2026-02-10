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

export async function getRecipe(slug: string, token?: string) {
  const options: RequestInit = {};
  if (token) {
    options.headers = { Authorization: `Bearer ${token}` };
  }
  return fetchAPI(`/api/recipes/${slug}`, options);
}

export async function generateRecipe(token: string, data: {
  requirement: string;
  domain?: string;
  examples?: any[];
}) {
  return fetchAPI("/api/recipes/builder/generate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function validateRecipe(token: string, recipe: any) {
  return fetchAPI("/api/recipes/builder/validate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ recipe }),
  });
}

export async function createCustomRecipe(token: string, recipe: any) {
  return fetchAPI("/api/recipes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ recipe }),
  });
}

export async function listMyRecipes(token: string) {
  return fetchAPI("/api/recipes/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export async function updateAgent(token: string, agentId: string, data: {
  name?: string;
  description?: string;
  status?: string;
}) {
  return fetchAPI(`/api/agents/${agentId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function deleteAgent(token: string, agentId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_URL}/api/agents/${agentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete agent: ${res.status}`);
  }
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

export async function getDashboardStats(token: string) {
  return fetchAPI("/api/analytics/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAnalyticsTimeline(token: string, days: number = 30) {
  return fetchAPI(`/api/analytics/timeline?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAnalyticsTrends(token: string, days: number = 30) {
  return fetchAPI(`/api/analytics/trends?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAnalyticsInsights(token: string) {
  return fetchAPI("/api/analytics/insights", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Clients
export async function getClientOverview(token: string, clientId: string) {
  return fetchAPI(`/api/clients/${clientId}/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Recommendations
export async function getRecipeRecommendations(token: string, domain?: string) {
  const url = domain ? `/api/recommendations/recipes?domain=${domain}` : "/api/recommendations/recipes";
  return fetchAPI(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getOptimizationRecommendations(token: string, agentId: string) {
  return fetchAPI(`/api/recommendations/optimizations?agent_id=${agentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Batches
export async function createBatch(token: string, data: {
  agent_id: string;
  name: string;
  items: Record<string, unknown>[];
  file_type?: string;
}) {
  return fetchAPI("/api/batches", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function listBatches(token: string) {
  return fetchAPI("/api/batches", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getBatch(token: string, id: string, offset = 0, limit = 50) {
  return fetchAPI(`/api/batches/${id}?offset=${offset}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function exportBatch(token: string, id: string, format: "csv" | "json") {
  const res = await fetch(
    `${API_BASE}/api/batches/${id}/export?format=${format}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Export failed");
  return res.text();
}
