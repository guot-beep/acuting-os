-- AcuTing Learn public content schema
-- This is separate from private clinical cases.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS public_content_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_zh TEXT,
  description_en TEXT,
  description_zh TEXT,
  display_order INTEGER
);

CREATE TABLE IF NOT EXISTS public_articles (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_zh TEXT,
  summary_en TEXT,
  summary_zh TEXT,
  body_en TEXT,
  body_zh TEXT,
  safety_note_en TEXT,
  evidence_note_en TEXT,
  review_status TEXT DEFAULT 'draft',
  source_policy TEXT DEFAULT 'rewrite_and_cross_check',
  last_reviewed_at TEXT,
  FOREIGN KEY (category_id) REFERENCES public_content_categories(id)
);

CREATE TABLE IF NOT EXISTS article_entity_links (
  article_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  relationship_type TEXT,
  display_label TEXT,
  PRIMARY KEY (article_id, entity_type, entity_id),
  FOREIGN KEY (article_id) REFERENCES public_articles(id)
);

CREATE TABLE IF NOT EXISTS translation_work_items (
  id TEXT PRIMARY KEY,
  source_title TEXT,
  source_url TEXT,
  target_article_id TEXT,
  source_language TEXT DEFAULT 'zh',
  target_language TEXT DEFAULT 'en',
  task_type TEXT DEFAULT 'rewrite_translate_cross_check',
  status TEXT DEFAULT 'todo',
  copyright_risk TEXT DEFAULT 'needs_review',
  notes TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (target_article_id) REFERENCES public_articles(id)
);

CREATE TABLE IF NOT EXISTS public_article_sources (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  source_title TEXT,
  source_url TEXT,
  source_type TEXT,
  authority_level TEXT,
  used_for TEXT,
  access_date TEXT,
  notes TEXT,
  FOREIGN KEY (article_id) REFERENCES public_articles(id)
);
