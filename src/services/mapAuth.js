// MAP LOGIN INTEGRATION: add the selected map provider SDK and token flow here.
// Read public map configuration from import.meta.env and keep private secrets server-side.
export function getMapConfig() {
  return {
    provider: import.meta.env.VITE_MAP_PROVIDER || "replace-with-map-provider",
    publicToken: import.meta.env.VITE_MAP_PUBLIC_TOKEN || "",
  };
}

// Add the login/session exchange here when the map provider requires user accounts.
export async function startMapSession() {
  throw new Error("Map authentication is not configured yet.");
}
