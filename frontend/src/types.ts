export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  source_icon: string;
  category: string;
  published: string | null;
  image_url: string | null;
  reading_time: number;
}

export interface NewsResponse {
  articles: Article[];
  category: string;
  updated_at: string;
  total: number;
}

export interface BriefingResponse {
  category: string;
  briefing: string;
  key_themes: string[];
  updated_at: string;
}

export interface CategoryInfo {
  label: string;
  color: string;
}

export type CategoryMap = Record<string, CategoryInfo>;

export type CategoryKey = "all" | "tech" | "ai" | "business" | "money" | "geopolitics";
