import {
  pgTable,
  serial,
  text,
  real,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  building: text("building").notNull(),
  floor: text("floor").notNull(),
  description: text("description").notNull().default(""),
  hours: text("hours").notNull().default(""),
  tags: text("tags").notNull().default(""),
  qrToken: text("qr_token").notNull().default(""),
  nodeId: text("node_id").notNull().default(""),
  mapX: real("map_x").notNull().default(0),
  mapY: real("map_y").notNull().default(0),
  mapW: real("map_w").notNull().default(0),
  mapH: real("map_h").notNull().default(0),
});

export const nodes = pgTable("nodes", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
});

export const edges = pgTable("edges", {
  id: serial("id").primaryKey(),
  fromNode: text("from_node").notNull(),
  toNode: text("to_node").notNull(),
  weight: real("weight").notNull(),
});

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  locationId: integer("location_id"),
  source: text("source").notNull().default("camera"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  tag: text("tag").notNull().default("Campus"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Location = typeof locations.$inferSelect;
export type GraphNode = typeof nodes.$inferSelect;
export type GraphEdge = typeof edges.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
