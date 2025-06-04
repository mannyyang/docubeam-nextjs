CREATE TABLE "credit_transaction" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"remaining_amount" integer DEFAULT 0 NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" varchar(255) NOT NULL,
	"expiration_date" timestamp,
	"expiration_date_processed_at" timestamp,
	"payment_intent_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "passkey_credential" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"credential_id" varchar(255) NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"transports" varchar(255),
	"aaguid" varchar(255),
	"user_agent" varchar(255),
	"ip_address" varchar(100),
	CONSTRAINT "passkey_credential_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "purchased_item" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"item_type" varchar(50) NOT NULL,
	"item_id" varchar(255) NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_invitation" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"team_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role_id" varchar(255) NOT NULL,
	"is_system_role" boolean DEFAULT true NOT NULL,
	"token" varchar(255) NOT NULL,
	"invited_by" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"accepted_by" varchar(255),
	CONSTRAINT "team_invitation_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "team_membership" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"team_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role_id" varchar(255) NOT NULL,
	"is_system_role" boolean DEFAULT true NOT NULL,
	"invited_by" varchar(255),
	"invited_at" timestamp,
	"joined_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_role" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"team_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"permissions" json NOT NULL,
	"metadata" json,
	"is_editable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"avatar_url" varchar(600),
	"settings" json,
	"billing_email" varchar(255),
	"plan_id" varchar(100),
	"plan_expires_at" timestamp,
	"credit_balance" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "team_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"update_counter" integer DEFAULT 0,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255),
	"password_hash" text,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"email_verified" timestamp,
	"sign_up_ip_address" varchar(100),
	"google_account_id" varchar(255),
	"avatar" varchar(600),
	"current_credits" integer DEFAULT 0 NOT NULL,
	"last_credit_refresh_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey_credential" ADD CONSTRAINT "passkey_credential_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchased_item" ADD CONSTRAINT "purchased_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitation" ADD CONSTRAINT "team_invitation_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitation" ADD CONSTRAINT "team_invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitation" ADD CONSTRAINT "team_invitation_accepted_by_user_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_role" ADD CONSTRAINT "team_role_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_transaction_user_id_idx" ON "credit_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_type_idx" ON "credit_transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_transaction_created_at_idx" ON "credit_transaction" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "credit_transaction_expiration_date_idx" ON "credit_transaction" USING btree ("expiration_date");--> statement-breakpoint
CREATE INDEX "credit_transaction_payment_intent_id_idx" ON "credit_transaction" USING btree ("payment_intent_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "passkey_credential" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credential_id_idx" ON "passkey_credential" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "purchased_item_user_id_idx" ON "purchased_item" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "purchased_item_type_idx" ON "purchased_item" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "purchased_item_user_item_idx" ON "purchased_item" USING btree ("user_id","item_type","item_id");--> statement-breakpoint
CREATE INDEX "team_invitation_team_id_idx" ON "team_invitation" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_invitation_email_idx" ON "team_invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "team_invitation_token_idx" ON "team_invitation" USING btree ("token");--> statement-breakpoint
CREATE INDEX "team_membership_team_id_idx" ON "team_membership" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_membership_user_id_idx" ON "team_membership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_membership_unique_idx" ON "team_membership" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "team_role_team_id_idx" ON "team_role" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_role_name_unique_idx" ON "team_role" USING btree ("team_id","name");--> statement-breakpoint
CREATE INDEX "team_slug_idx" ON "team" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "google_account_id_idx" ON "user" USING btree ("google_account_id");--> statement-breakpoint
CREATE INDEX "role_idx" ON "user" USING btree ("role");