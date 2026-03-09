import {
  pgTable,
  text,
  timestamp,
  jsonb,
  real,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

export const researchSessions = pgTable("research_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  query: text("query").notNull(),
  status: text("status").notNull().default("intake"),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const researchPlans = pgTable("research_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => researchSessions.id, { onDelete: "cascade" }),
  objective: text("objective").notNull(),
  subquestions: jsonb("subquestions").notNull().default([]),
  searchQueries: jsonb("search_queries").notNull().default({}),
  successCriteria: jsonb("success_criteria").notNull().default([]),
});

export const researchSources = pgTable("research_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => researchSessions.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'web' | 'paper'
  title: text("title").notNull(),
  url: text("url").notNull(),
  snippet: text("snippet").notNull().default(""),
  authors: jsonb("authors").default([]),
  publishedAt: text("published_at"),
  domain: text("domain"),
  score: real("score").notNull().default(0),
  citationLabel: text("citation_label"),
});

export const researchOutputs = pgTable("research_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => researchSessions.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  keyFindings: jsonb("key_findings").notNull().default([]),
  openQuestions: jsonb("open_questions").notNull().default([]),
  limitations: jsonb("limitations").notNull().default([]),
  citations: jsonb("citations").notNull().default([]),
});

export const evaluationResults = pgTable("evaluation_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => researchSessions.id, { onDelete: "cascade" }),
  sourceCount: integer("source_count").notNull().default(0),
  coverageScore: real("coverage_score").notNull().default(0),
  citationCompleteness: real("citation_completeness").notNull().default(0),
  latencyMs: integer("latency_ms").notNull().default(0),
  estimatedCostUsd: real("estimated_cost_usd").notNull().default(0),
  warnings: jsonb("warnings").notNull().default([]),
});
