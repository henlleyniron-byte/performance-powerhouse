CREATE TABLE `study_goals` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`period` text NOT NULL,
	`metric` text NOT NULL,
	`target` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE INDEX `study_goals_user_period_idx` ON `study_goals` (`user_id`,`period`);--> statement-breakpoint
CREATE TABLE `study_migrations` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`version` text NOT NULL,
	`records_imported` integer DEFAULT 0 NOT NULL,
	`source_checksum` text DEFAULT '' NOT NULL,
	`integrity_result` text NOT NULL,
	`migrated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE TABLE `study_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`timezone` text DEFAULT 'Asia/Colombo' NOT NULL,
	`settings_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`session_type` text NOT NULL,
	`status` text DEFAULT 'completed' NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`planned_duration_seconds` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`linked_attempt_id` text,
	`evidence_kind` text DEFAULT 'none' NOT NULL,
	`output_count` integer DEFAULT 0 NOT NULL,
	`output_unit` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'powerhouse-study-tracker' NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`client_updated_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE INDEX `study_sessions_user_started_idx` ON `study_sessions` (`user_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `study_sessions_user_subject_idx` ON `study_sessions` (`user_id`,`subject`);