-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google', 'facebook');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'blocked', 'deleted', 'expired', 'pending_verification');

-- CreateEnum
CREATE TYPE "ThreadStatus" AS ENUM ('draft', 'planning', 'confirmed', 'completed', 'cancelled', 'dropped');

-- CreateEnum
CREATE TYPE "ThreadSubStatus" AS ENUM ('understanding', 'timeline_preparation', 'timeline_finalized');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'markdown', 'image', 'card', 'json', 'error');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "TimelineStatus" AS ENUM ('draft', 'in_progress', 'ready', 'confirmed', 'archived');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('confirmed', 'approx');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('start', 'end', 'task_node', 'representation_node', 'action', 'representation', 'additional_input');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('active', 'inactive', 'in_progress');

-- CreateEnum
CREATE TYPE "DisplayDateType" AS ENUM ('date', 'date_range', 'time', 'time_range');

-- CreateEnum
CREATE TYPE "TasksStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('pending', 'reviewed', 'accepted');

-- CreateEnum
CREATE TYPE "ElementType" AS ENUM ('task', 'recommendation');

-- CreateEnum
CREATE TYPE "ElementStatus" AS ENUM ('confirmed', 'pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('flight_delay', 'flight_change', 'weather_alert', 'booking_confirmation', 'reminder', 'travel_update', 'system');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "DisplayType" AS ENUM ('mobile', 'desktop', 'all');

-- CreateEnum
CREATE TYPE "SuggestionCategory" AS ENUM ('long_time_plan', 'short_time_plan', 'weekend_plan', 'quick_trip');

-- CreateTable
CREATE TABLE "users" (
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "auth_provider" "AuthProvider" NOT NULL,
    "auth_provider_id" VARCHAR(255),
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_number" VARCHAR(20),
    "phone_number_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(500),
    "name" VARCHAR(255) NOT NULL,
    "is_primary_member" BOOLEAN NOT NULL DEFAULT false,
    "dob" DATE,
    "relation" VARCHAR(100),
    "interest_profile" JSONB,
    "location_details" JSONB,
    "travel_profile" JSONB,
    "travel_instructions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threads" (
    "id" UUID NOT NULL,
    "user_email" VARCHAR(255),
    "timeline_id" UUID,
    "timeline_ready_progress" INTEGER NOT NULL DEFAULT 0,
    "status" "ThreadStatus" NOT NULL DEFAULT 'draft',
    "sub_status" "ThreadSubStatus",
    "summary" VARCHAR(500),
    "version_details" JSONB,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "view" VARCHAR(50) NOT NULL DEFAULT 'init-chat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_contexts" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "budget" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "start_date" DATE,
    "end_date" DATE,
    "plan_summary" TEXT,
    "travellers_details" JSONB,
    "journey_context" TEXT,
    "general_instructions" JSONB,
    "user_actions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thread_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "sender_id" VARCHAR(255) NOT NULL,
    "role" "MessageRole" NOT NULL,
    "type" "MessageType" NOT NULL,
    "content" BYTEA NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'sent',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timelines" (
    "id" UUID NOT NULL,
    "rendering_style" VARCHAR(50) NOT NULL DEFAULT 'default',
    "start_date" DATE,
    "end_date" DATE,
    "budget" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "budget_type" "BudgetType" NOT NULL DEFAULT 'approx',
    "adults_count" INTEGER NOT NULL DEFAULT 1,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "timeline_context" TEXT,
    "status" "TimelineStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_nodes" (
    "id" UUID NOT NULL,
    "timeline_id" UUID NOT NULL,
    "node_version" INTEGER NOT NULL DEFAULT 1,
    "status" "NodeStatus" NOT NULL DEFAULT 'active',
    "order" INTEGER NOT NULL,
    "type" "NodeType" NOT NULL,
    "subtype" VARCHAR(50),
    "display_title" VARCHAR(255),
    "display_subtitle" VARCHAR(255),
    "display_icon" JSONB,
    "node_summary" JSONB,
    "tasks_status" "TasksStatus",
    "recommendation_status" "RecommendationStatus",
    "display_date_type" "DisplayDateType",
    "display_date_label" VARCHAR(100),
    "display_date_start" TIMESTAMP(3),
    "display_date_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_node_elements" (
    "id" UUID NOT NULL,
    "timeline_node_id" UUID NOT NULL,
    "timeline_id" UUID NOT NULL,
    "element_type" "ElementType" NOT NULL,
    "element_category" VARCHAR(100) NOT NULL,
    "element_icon" JSONB,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price_range" JSONB,
    "status" "ElementStatus" NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_node_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "thread_id" UUID,
    "timeline_id" UUID,
    "version" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'medium',
    "type" "NotificationType" NOT NULL,
    "action_url" VARCHAR(500),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "flight_updates" BOOLEAN NOT NULL DEFAULT true,
    "weather_alerts" BOOLEAN NOT NULL DEFAULT true,
    "booking_reminders" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_templates" (
    "id" UUID NOT NULL,
    "priority" INTEGER NOT NULL,
    "template_text" TEXT NOT NULL,
    "description" VARCHAR(255),
    "display_type" "DisplayType" NOT NULL DEFAULT 'all',
    "category" "SuggestionCategory" NOT NULL,
    "locality_lat" DOUBLE PRECISION,
    "locality_lng" DOUBLE PRECISION,
    "locality_radius_km" INTEGER NOT NULL DEFAULT 50,
    "placeholder_options" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestion_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "device_info" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_auth_provider_auth_provider_id_idx" ON "users"("auth_provider", "auth_provider_id");

-- CreateIndex
CREATE INDEX "members_user_email_idx" ON "members"("user_email");

-- CreateIndex
CREATE INDEX "members_user_email_is_primary_member_idx" ON "members"("user_email", "is_primary_member");

-- CreateIndex
CREATE UNIQUE INDEX "threads_timeline_id_key" ON "threads"("timeline_id");

-- CreateIndex
CREATE INDEX "threads_user_email_idx" ON "threads"("user_email");

-- CreateIndex
CREATE INDEX "threads_status_idx" ON "threads"("status");

-- CreateIndex
CREATE UNIQUE INDEX "thread_contexts_thread_id_key" ON "thread_contexts"("thread_id");

-- CreateIndex
CREATE INDEX "messages_thread_id_idx" ON "messages"("thread_id");

-- CreateIndex
CREATE INDEX "messages_thread_id_created_at_idx" ON "messages"("thread_id", "created_at");

-- CreateIndex
CREATE INDEX "timelines_status_idx" ON "timelines"("status");

-- CreateIndex
CREATE INDEX "timeline_nodes_timeline_id_idx" ON "timeline_nodes"("timeline_id");

-- CreateIndex
CREATE INDEX "timeline_nodes_timeline_id_order_idx" ON "timeline_nodes"("timeline_id", "order");

-- CreateIndex
CREATE INDEX "timeline_nodes_type_idx" ON "timeline_nodes"("type");

-- CreateIndex
CREATE INDEX "timeline_nodes_status_idx" ON "timeline_nodes"("status");

-- CreateIndex
CREATE INDEX "timeline_node_elements_timeline_node_id_idx" ON "timeline_node_elements"("timeline_node_id");

-- CreateIndex
CREATE INDEX "timeline_node_elements_timeline_id_idx" ON "timeline_node_elements"("timeline_id");

-- CreateIndex
CREATE INDEX "timeline_node_elements_element_type_idx" ON "timeline_node_elements"("element_type");

-- CreateIndex
CREATE INDEX "timeline_node_elements_status_idx" ON "timeline_node_elements"("status");

-- CreateIndex
CREATE INDEX "notifications_thread_id_idx" ON "notifications"("thread_id");

-- CreateIndex
CREATE INDEX "notifications_timeline_id_idx" ON "notifications"("timeline_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_email_key" ON "notification_preferences"("user_email");

-- CreateIndex
CREATE INDEX "suggestion_templates_priority_idx" ON "suggestion_templates"("priority");

-- CreateIndex
CREATE INDEX "suggestion_templates_is_active_idx" ON "suggestion_templates"("is_active");

-- CreateIndex
CREATE INDEX "suggestion_templates_category_idx" ON "suggestion_templates"("category");

-- CreateIndex
CREATE INDEX "suggestion_templates_locality_lat_locality_lng_idx" ON "suggestion_templates"("locality_lat", "locality_lng");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_email_idx" ON "refresh_tokens"("user_email");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_contexts" ADD CONSTRAINT "thread_contexts_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_nodes" ADD CONSTRAINT "timeline_nodes_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_node_elements" ADD CONSTRAINT "timeline_node_elements_timeline_node_id_fkey" FOREIGN KEY ("timeline_node_id") REFERENCES "timeline_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_node_elements" ADD CONSTRAINT "timeline_node_elements_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
