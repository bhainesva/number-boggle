import { STORAGE_KEY } from "./const";

export function mergeStorage(newSettings: Record<string, unknown>) {
  const cur = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...cur,
      ...newSettings,
    })
  );
}
