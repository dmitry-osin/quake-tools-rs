import { invoke } from "@tauri-apps/api/core";

export type CvarCategorySummary = {
  name: string;
  commandCount: number;
};

export type CvarSearchResult = {
  name: string;
  friendlyName: string | null;
  shortDescription: string | null;
  category: string;
};

export type CvarQueryResponse = {
  items: CvarSearchResult[];
  total: number;
  page: number;
  pageSize: number;
};

export type CvarAvailableSetting = {
  value: string;
  description: string;
  isDefault: boolean;
};

export type CvarDetail = {
  name: string;
  friendlyName: string | null;
  dataType: string | null;
  shortDescription: string | null;
  description: string | null;
  proTip: string | null;
  performanceImpact: string | null;
  defaultValue: string | null;
  category: string;
  categoryUrl: string | null;
  url: string | null;
  availableSettings: CvarAvailableSetting[];
};

export async function listCvarCategories(): Promise<CvarCategorySummary[]> {
  return invoke<CvarCategorySummary[]>("list_cvar_categories");
}

export async function queryCvars(
  query: string | null,
  category: string | null,
  page: number,
  pageSize: number,
): Promise<CvarQueryResponse> {
  return invoke<CvarQueryResponse>("query_cvars", { query, category, page, pageSize });
}

export async function getCvarDetail(name: string): Promise<CvarDetail | null> {
  return invoke<CvarDetail | null>("get_cvar_detail", { name });
}
