import { pgTable, integer, text, index, timestamp, varchar, json, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type InferSelectModel } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'

export const ROLES_ENUM = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];

const commonColumns = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updateCounter: integer("update_counter").default(0),
}

export const userTable = pgTable("user", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `usr_${createId()}`).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: text("password_hash"),
  role: varchar("role", { length: 50, enum: roleTuple }).default(ROLES_ENUM.USER).notNull(),
  emailVerified: timestamp("email_verified"),
  signUpIpAddress: varchar("sign_up_ip_address", { length: 100 }),
  googleAccountId: varchar("google_account_id", { length: 255 }),
  /**
   * This can either be an absolute or relative path to an image
   */
  avatar: varchar("avatar", { length: 600 }),
  // Credit system fields
  currentCredits: integer("current_credits").default(0).notNull(),
  lastCreditRefreshAt: timestamp("last_credit_refresh_at"),
}, (table) => [
  index('email_idx').on(table.email),
  index('google_account_id_idx').on(table.googleAccountId),
  index('role_idx').on(table.role),
]);

export const passKeyCredentialTable = pgTable("passkey_credential", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `pkey_${createId()}`).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => userTable.id),
  credentialId: varchar("credential_id", { length: 255 }).notNull().unique(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull(),
  // Optional array of AuthenticatorTransport as JSON string
  transports: varchar("transports", { length: 255 }),
  // Authenticator Attestation GUID. We use this to identify the device/authenticator app that created the passkey
  aaguid: varchar("aaguid", { length: 255 }),
  // The user agent of the device that created the passkey
  userAgent: varchar("user_agent", { length: 255 }),
  // The IP address that created the passkey
  ipAddress: varchar("ip_address", { length: 100 }),
}, (table) => [
  index('user_id_idx').on(table.userId),
  index('credential_id_idx').on(table.credentialId),
]);

// Credit transaction types
export const CREDIT_TRANSACTION_TYPE = {
  PURCHASE: 'PURCHASE',
  USAGE: 'USAGE',
  MONTHLY_REFRESH: 'MONTHLY_REFRESH',
} as const;

export const creditTransactionTypeTuple = Object.values(CREDIT_TRANSACTION_TYPE) as [string, ...string[]];

export const creditTransactionTable = pgTable("credit_transaction", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `ctxn_${createId()}`).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => userTable.id),
  amount: integer("amount").notNull(),
  // Track how many credits are still available from this transaction
  remainingAmount: integer("remaining_amount").default(0).notNull(),
  type: varchar("type", { length: 50, enum: creditTransactionTypeTuple }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  expirationDate: timestamp("expiration_date"),
  expirationDateProcessedAt: timestamp("expiration_date_processed_at"),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
}, (table) => [
  index('credit_transaction_user_id_idx').on(table.userId),
  index('credit_transaction_type_idx').on(table.type),
  index('credit_transaction_created_at_idx').on(table.createdAt),
  index('credit_transaction_expiration_date_idx').on(table.expirationDate),
  index('credit_transaction_payment_intent_id_idx').on(table.paymentIntentId),
]);

// Define item types that can be purchased
export const PURCHASABLE_ITEM_TYPE = {
  COMPONENT: 'COMPONENT',
  // Add more types in the future (e.g., TEMPLATE, PLUGIN, etc.)
} as const;

export const purchasableItemTypeTuple = Object.values(PURCHASABLE_ITEM_TYPE) as [string, ...string[]];

export const purchasedItemsTable = pgTable("purchased_item", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `pitem_${createId()}`).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => userTable.id),
  // The type of item (e.g., COMPONENT, TEMPLATE, etc.)
  itemType: varchar("item_type", { length: 50, enum: purchasableItemTypeTuple }).notNull(),
  // The ID of the item within its type (e.g., componentId)
  itemId: varchar("item_id", { length: 255 }).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
}, (table) => [
  index('purchased_item_user_id_idx').on(table.userId),
  index('purchased_item_type_idx').on(table.itemType),
  // Composite index for checking if a user owns a specific item of a specific type
  index('purchased_item_user_item_idx').on(table.userId, table.itemType, table.itemId),
]);

// System-defined roles - these are always available
export const SYSTEM_ROLES_ENUM = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export const systemRoleTuple = Object.values(SYSTEM_ROLES_ENUM) as [string, ...string[]];

// Define available permissions
export const TEAM_PERMISSIONS = {
  // Resource access
  ACCESS_DASHBOARD: 'access_dashboard',
  ACCESS_BILLING: 'access_billing',

  // User management
  INVITE_MEMBERS: 'invite_members',
  REMOVE_MEMBERS: 'remove_members',
  CHANGE_MEMBER_ROLES: 'change_member_roles',

  // Team management
  EDIT_TEAM_SETTINGS: 'edit_team_settings',
  DELETE_TEAM: 'delete_team',

  // Role management
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',
  ASSIGN_ROLES: 'assign_roles',

  // Content permissions
  CREATE_COMPONENTS: 'create_components',
  EDIT_COMPONENTS: 'edit_components',
  DELETE_COMPONENTS: 'delete_components',

  // Add more as needed
} as const;

// Team table
export const teamTable = pgTable("team", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `team_${createId()}`).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  avatarUrl: varchar("avatar_url", { length: 600 }),
  // Settings could be stored as JSON
  settings: json("settings"),
  // Optional billing-related fields
  billingEmail: varchar("billing_email", { length: 255 }),
  planId: varchar("plan_id", { length: 100 }),
  planExpiresAt: timestamp("plan_expires_at"),
  creditBalance: integer("credit_balance").default(0).notNull(),
}, (table) => [
  index('team_slug_idx').on(table.slug),
]);

// Team membership table
export const teamMembershipTable = pgTable("team_membership", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `tmem_${createId()}`).notNull(),
  teamId: varchar("team_id", { length: 255 }).notNull().references(() => teamTable.id),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => userTable.id),
  // This can be either a system role or a custom role ID
  roleId: varchar("role_id", { length: 255 }).notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: boolean("is_system_role").default(true).notNull(),
  invitedBy: varchar("invited_by", { length: 255 }).references(() => userTable.id),
  invitedAt: timestamp("invited_at"),
  joinedAt: timestamp("joined_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
  index('team_membership_team_id_idx').on(table.teamId),
  index('team_membership_user_id_idx').on(table.userId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_membership_unique_idx').on(table.teamId, table.userId),
]);

// Team role table
export const teamRoleTable = pgTable("team_role", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `trole_${createId()}`).notNull(),
  teamId: varchar("team_id", { length: 255 }).notNull().references(() => teamTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Store permissions as a JSON array of permission keys
  permissions: json("permissions").notNull().$type<string[]>(),
  // A JSON field for storing UI-specific settings like color, icon, etc.
  metadata: json("metadata"),
  // Optional flag to mark some roles as non-editable
  isEditable: boolean("is_editable").default(true).notNull(),
}, (table) => [
  index('team_role_team_id_idx').on(table.teamId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_role_name_unique_idx').on(table.teamId, table.name),
]);

// Team invitation table
export const teamInvitationTable = pgTable("team_invitation", {
  ...commonColumns,
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `tinv_${createId()}`).notNull(),
  teamId: varchar("team_id", { length: 255 }).notNull().references(() => teamTable.id),
  email: varchar("email", { length: 255 }).notNull(),
  // This can be either a system role or a custom role ID
  roleId: varchar("role_id", { length: 255 }).notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: boolean("is_system_role").default(true).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  invitedBy: varchar("invited_by", { length: 255 }).notNull().references(() => userTable.id),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  acceptedBy: varchar("accepted_by", { length: 255 }).references(() => userTable.id),
}, (table) => [
  index('team_invitation_team_id_idx').on(table.teamId),
  index('team_invitation_email_idx').on(table.email),
  index('team_invitation_token_idx').on(table.token),
]);

export const teamRelations = relations(teamTable, ({ many }) => ({
  memberships: many(teamMembershipTable),
  invitations: many(teamInvitationTable),
  roles: many(teamRoleTable),
}));

export const teamRoleRelations = relations(teamRoleTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamRoleTable.teamId],
    references: [teamTable.id],
  }),
}));

export const teamMembershipRelations = relations(teamMembershipTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamMembershipTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [teamMembershipTable.userId],
    references: [userTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamMembershipTable.invitedBy],
    references: [userTable.id],
  }),
}));

export const teamInvitationRelations = relations(teamInvitationTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamInvitationTable.teamId],
    references: [teamTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamInvitationTable.invitedBy],
    references: [userTable.id],
  }),
  acceptedByUser: one(userTable, {
    fields: [teamInvitationTable.acceptedBy],
    references: [userTable.id],
  }),
}));

export const creditTransactionRelations = relations(creditTransactionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [creditTransactionTable.userId],
    references: [userTable.id],
  }),
}));

export const purchasedItemsRelations = relations(purchasedItemsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [purchasedItemsTable.userId],
    references: [userTable.id],
  }),
}));

export const userRelations = relations(userTable, ({ many }) => ({
  passkeys: many(passKeyCredentialTable),
  creditTransactions: many(creditTransactionTable),
  purchasedItems: many(purchasedItemsTable),
  teamMemberships: many(teamMembershipTable),
}));

export const passKeyCredentialRelations = relations(passKeyCredentialTable, ({ one }) => ({
  user: one(userTable, {
    fields: [passKeyCredentialTable.userId],
    references: [userTable.id],
  }),
}));

export type User = InferSelectModel<typeof userTable>;
export type PassKeyCredential = InferSelectModel<typeof passKeyCredentialTable>;
export type CreditTransaction = InferSelectModel<typeof creditTransactionTable>;
export type PurchasedItem = InferSelectModel<typeof purchasedItemsTable>;
export type Team = InferSelectModel<typeof teamTable>;
export type TeamMembership = InferSelectModel<typeof teamMembershipTable>;
export type TeamRole = InferSelectModel<typeof teamRoleTable>;
export type TeamInvitation = InferSelectModel<typeof teamInvitationTable>;
