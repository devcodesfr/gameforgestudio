import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("developer"), // developer or regular
  avatar: text("avatar"),
  banner: text("banner"),
  // Profile fields for Buttonz user management
  bio: text("bio"),
  jobTitle: text("job_title"),
  status: text("status"),
  location: text("location"),
  portfolioLink: text("portfolio_link"),
  skills: text("skills").array().default([]),
  currentProject: text("current_project"),
  availability: text("availability").default("online"), // online, away, busy, offline
  // User settings
  settings: jsonb("settings").default({
    notifications: {
      projectUpdates: true,
      teamMessages: true,
      communityActivity: true,
    },
    privacy: {
      profileVisibility: "public",
      whoCanMessage: "everyone",
    },
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("🎮"),
  status: text("status").notNull().default("not-started"), // not-started, in-progress, live
  engine: text("engine").notNull(), // unity, unreal, godot, html5, custom
  platform: text("platform").notNull(), // pc, mobile, console, vr, web
  ownerId: varchar("owner_id").notNull(),
  teamMembers: text("team_members").array().notNull().default([]),
  features: text("features").array().notNull().default([]),
  screenshots: text("screenshots").array().notNull().default([]),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const metrics = pgTable("metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  activeProjects: integer("active_projects").notNull().default(0),
  teamMembers: integer("team_members").notNull().default(0),
  assetsCreated: integer("assets_created").notNull().default(0),
  gamesPublished: integer("games_published").notNull().default(0),
  revenue: integer("revenue").notNull().default(0), // in cents
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game Library for Regular Users
export const gameLibrary = pgTable("game_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  gameId: varchar("game_id").notNull(), // References a published project
  gameName: text("game_name").notNull(),
  gameIcon: text("game_icon").notNull().default("🎮"),
  gameDescription: text("game_description"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  lastPlayed: timestamp("last_played"),
  playTime: integer("play_time").notNull().default(0), // in minutes
  favorite: integer("favorite").notNull().default(0), // 0 = false, 1 = true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertMetricsSchema = createInsertSchema(metrics).omit({
  id: true,
  updatedAt: true,
});

export const insertGameLibrarySchema = createInsertSchema(gameLibrary).omit({
  id: true,
  purchasedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Metrics = typeof metrics.$inferSelect;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type GameLibrary = typeof gameLibrary.$inferSelect;
export type InsertGameLibrary = z.infer<typeof insertGameLibrarySchema>;

// User role enum for type safety
export const UserRole = {
  DEVELOPER: "developer",
  REGULAR: "regular",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Project status enum for type safety
export const ProjectStatus = {
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress", 
  LIVE: "live",
} as const;

export type ProjectStatusType = typeof ProjectStatus[keyof typeof ProjectStatus];

// Game engine enum
export const GameEngine = {
  UNITY: "unity",
  UNREAL: "unreal",
  GODOT: "godot",
  HTML5: "html5",
  CUSTOM: "custom",
} as const;

export type GameEngineType = typeof GameEngine[keyof typeof GameEngine];

// Platform enum
export const Platform = {
  PC: "pc",
  MOBILE: "mobile",
  CONSOLE: "console",
  VR: "vr",
  WEB: "web",
} as const;

export type PlatformType = typeof Platform[keyof typeof Platform];

// Asset Store tables
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // music, graphics, sounds, tools, scripts
  price: integer("price").notNull(), // in cents
  originalPrice: integer("original_price"), // for discounts, in cents
  thumbnail: text("thumbnail").notNull(),
  fileUrl: text("file_url").notNull(),
  previewUrl: text("preview_url"), // for audio/video previews
  tags: text("tags").array().notNull().default([]),
  downloads: integer("downloads").notNull().default(0),
  rating: integer("rating").notNull().default(0), // 1-5 stars * 100 (e.g., 450 = 4.5 stars)
  reviewCount: integer("review_count").notNull().default(0),
  fileSize: text("file_size").notNull(), // e.g., "2.5 MB"
  format: text("format").notNull(), // e.g., "MP3", "PNG", "WAV", "Unity Package"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assetBundles = pgTable("asset_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  originalPrice: integer("original_price"), // total original price
  discount: integer("discount").notNull().default(0), // percentage discount
  thumbnail: text("thumbnail").notNull(),
  assetIds: text("asset_ids").array().notNull().default([]),
  downloads: integer("downloads").notNull().default(0),
  rating: integer("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assetId: varchar("asset_id"),
  bundleId: varchar("bundle_id"),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assetId: varchar("asset_id"),
  bundleId: varchar("bundle_id"),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull().default("completed"), // completed, pending, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for Asset Store
export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetBundleSchema = createInsertSchema(assetBundles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

// Types for Asset Store
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type AssetBundle = typeof assetBundles.$inferSelect;
export type InsertAssetBundle = z.infer<typeof insertAssetBundleSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

// Asset categories enum
export const AssetCategory = {
  MUSIC: "music",
  GRAPHICS: "graphics",
  SOUNDS: "sounds", 
  TOOLS: "tools",
  SCRIPTS: "scripts",
} as const;

export type AssetCategoryType = typeof AssetCategory[keyof typeof AssetCategory];

// Buttonz Chat System tables
export const chats = pgTable("chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("group"), // "direct", "group", "main"
  isMainChat: integer("is_main_chat").notNull().default(0), // 1 for main team chat, 0 for others
  createdBy: varchar("created_by").notNull(), // user id who created the chat
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMembers = pgTable("chat_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default("member"), // "admin", "member"
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // "text", "image", "file", "system"
  editedAt: timestamp("edited_at"),
  replyToId: varchar("reply_to_id"), // for threaded messages
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for Buttonz
export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMemberSchema = createInsertSchema(chatMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types for Buttonz
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type ChatMember = typeof chatMembers.$inferSelect;
export type InsertChatMember = z.infer<typeof insertChatMemberSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Chat type enum
export const ChatType = {
  DIRECT: "direct",
  GROUP: "group", 
  MAIN: "main",
} as const;

export type ChatTypeType = typeof ChatType[keyof typeof ChatType];

// Message type enum
export const MessageType = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  SYSTEM: "system",
} as const;

export type MessageTypeType = typeof MessageType[keyof typeof MessageType];

// Community & Calendar System tables
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(), // user who created the post
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // "text", "event"
  eventId: varchar("event_id"), // linked event if post type is "event"
  likesCount: integer("likes_count").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postReplies = pgTable("post_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "release", "meeting", "social", "virtual", "in-person"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"), // for in-person events or virtual meeting links
  createdBy: varchar("created_by").notNull(), // user who created the event
  maxAttendees: integer("max_attendees"), // optional capacity limit
  rsvpCount: integer("rsvp_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default("attending"), // "attending", "maybe", "not-attending"
  response: text("response"), // optional response/comment
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for Community & Calendar
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likesCount: true,
  repliesCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export const insertPostReplySchema = createInsertSchema(postReplies).omit({
  id: true,
  likesCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  rsvpCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for Community & Calendar
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostReply = typeof postReplies.$inferSelect;
export type InsertPostReply = z.infer<typeof insertPostReplySchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;

// Post type enum
export const PostType = {
  TEXT: "text",
  EVENT: "event",
} as const;

export type PostTypeType = typeof PostType[keyof typeof PostType];

// Event type enum
export const EventType = {
  RELEASE: "release",
  MEETING: "meeting",
  SOCIAL: "social",
  VIRTUAL: "virtual",
  IN_PERSON: "in-person",
} as const;

export type EventTypeType = typeof EventType[keyof typeof EventType];

// RSVP status enum
export const RsvpStatus = {
  ATTENDING: "attending",
  MAYBE: "maybe",
  NOT_ATTENDING: "not-attending",
} as const;

export type RsvpStatusType = typeof RsvpStatus[keyof typeof RsvpStatus];
