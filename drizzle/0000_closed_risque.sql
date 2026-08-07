CREATE TABLE "ai_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"module" text NOT NULL,
	"action" text NOT NULL,
	"status" text NOT NULL,
	"equipment_id" text,
	"equipment_name" text,
	"duration_ms" integer DEFAULT 0,
	"summary" text,
	"details_json" text,
	"timestamp" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"equipment_id" text,
	"equipment_name" text,
	"module" text NOT NULL,
	"analysis_type" text NOT NULL,
	"risk_score" integer,
	"compliance_status" text,
	"maintenance_prediction" text,
	"recommendations_json" text,
	"raw_output" text,
	"date" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calibration" (
	"id" text PRIMARY KEY NOT NULL,
	"equipment_id" text NOT NULL,
	"equipment_name" text NOT NULL,
	"engineer" text NOT NULL,
	"type" text NOT NULL,
	"scheduled_date" text NOT NULL,
	"due_date" text,
	"notes" text,
	"status" text DEFAULT 'Scheduled' NOT NULL,
	"certificate_url" text,
	"certificate_name" text,
	"certificate_date" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"head" text,
	"contact" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"department" text NOT NULL,
	"manufacturer" text NOT NULL,
	"model_number" text NOT NULL,
	"serial_number" text NOT NULL,
	"installation_date" text DEFAULT '2025-01-15',
	"status" text DEFAULT 'Operational' NOT NULL,
	"risk_level" text DEFAULT 'Healthy' NOT NULL,
	"last_maintenance" text,
	"next_maintenance" text,
	"last_calibration" text,
	"next_calibration" text,
	"warranty_expiry" text,
	"certification_expiry" text,
	"assigned_engineer" text,
	"expected_lifetime" integer DEFAULT 10,
	"health_score" integer DEFAULT 100,
	"risk_score" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance" (
	"id" text PRIMARY KEY NOT NULL,
	"equipment_id" text NOT NULL,
	"equipment_name" text NOT NULL,
	"engineer" text NOT NULL,
	"type" text NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"scheduled_date" text NOT NULL,
	"time" text,
	"duration" text,
	"notes" text,
	"status" text DEFAULT 'Scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"timestamp" text NOT NULL,
	"read" boolean DEFAULT false,
	"archived" boolean DEFAULT false,
	"equipment_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"generated_by" text NOT NULL,
	"department" text,
	"date" text NOT NULL,
	"status" text DEFAULT 'Ready' NOT NULL,
	"summary" text,
	"download_url" text,
	"content_json" text,
	"cached_at" text,
	"file_size" text,
	"is_cached" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"role" text DEFAULT 'Biomedical Engineer',
	"department" text DEFAULT 'Emergency & ICU',
	"hospital" text DEFAULT 'Apollo Hospitals',
	"phone" text,
	"bio" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "calibration" ADD CONSTRAINT "calibration_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;