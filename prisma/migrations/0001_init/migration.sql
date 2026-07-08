-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "role" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "avatar_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" BIGINT NOT NULL,
    "current_class_id" BIGINT,
    "credits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,

    CONSTRAINT "topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_date" TIMESTAMPTZ,
    "location" VARCHAR(255),
    "author_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" BIGSERIAL NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "position" INTEGER NOT NULL,
    "post_id" BIGINT NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll" (
    "id" BIGSERIAL NOT NULL,
    "question" VARCHAR(255) NOT NULL,
    "post_id" BIGINT NOT NULL,

    CONSTRAINT "poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_option" (
    "id" BIGSERIAL NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "poll_id" BIGINT NOT NULL,

    CONSTRAINT "poll_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" BIGINT NOT NULL,
    "post_id" BIGINT NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ,
    "sender_id" BIGINT NOT NULL,
    "receiver_id" BIGINT NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_topic" (
    "post_id" BIGINT NOT NULL,
    "topic_id" BIGINT NOT NULL,

    CONSTRAINT "post_topic_pkey" PRIMARY KEY ("post_id","topic_id")
);

-- CreateTable
CREATE TABLE "followed_topic" (
    "user_id" BIGINT NOT NULL,
    "topic_id" BIGINT NOT NULL,

    CONSTRAINT "followed_topic_pkey" PRIMARY KEY ("user_id","topic_id")
);

-- CreateTable
CREATE TABLE "followed_category" (
    "user_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,

    CONSTRAINT "followed_category_pkey" PRIMARY KEY ("user_id","category_id")
);

-- CreateTable
CREATE TABLE "user_skill" (
    "user_id" BIGINT NOT NULL,
    "skill_id" BIGINT NOT NULL,

    CONSTRAINT "user_skill_pkey" PRIMARY KEY ("user_id","skill_id")
);

-- CreateTable
CREATE TABLE "post_like" (
    "user_id" BIGINT NOT NULL,
    "post_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_like_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "bookmark" (
    "user_id" BIGINT NOT NULL,
    "post_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "vote" (
    "user_id" BIGINT NOT NULL,
    "option_id" BIGINT NOT NULL,
    "poll_id" BIGINT NOT NULL,

    CONSTRAINT "vote_pkey" PRIMARY KEY ("user_id","poll_id")
);

-- CreateTable
CREATE TABLE "formation_video" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "video_url" VARCHAR(500) NOT NULL,

    CONSTRAINT "formation_video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_session" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "formation_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_registration" (
    "id" BIGSERIAL NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "payment_method" VARCHAR(20),
    "credited_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "session_id" BIGINT NOT NULL,

    CONSTRAINT "formation_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" BIGSERIAL NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMPTZ,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" BIGSERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "session_id" BIGINT NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "user_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_unique" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "class_name_unique" ON "class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "topic_name_unique" ON "topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "topic_slug_unique" ON "topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_unique" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_unique" ON "skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_name_unique" ON "company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "poll_post_id_unique" ON "poll"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "formation_registration_user_session_unique" ON "formation_registration"("user_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_user_session_unique" ON "review"("user_id", "session_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_current_class_id_foreign" FOREIGN KEY ("current_class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_foreign" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_category_id_foreign" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poll" ADD CONSTRAINT "poll_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poll_option" ADD CONSTRAINT "poll_option_poll_id_foreign" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_foreign" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_foreign" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_receiver_id_foreign" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_topic" ADD CONSTRAINT "post_topic_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_topic" ADD CONSTRAINT "post_topic_topic_id_foreign" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followed_topic" ADD CONSTRAINT "followed_topic_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followed_topic" ADD CONSTRAINT "followed_topic_topic_id_foreign" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followed_category" ADD CONSTRAINT "followed_category_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followed_category" ADD CONSTRAINT "followed_category_category_id_foreign" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_skill" ADD CONSTRAINT "user_skill_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_skill" ADD CONSTRAINT "user_skill_skill_id_foreign" FOREIGN KEY ("skill_id") REFERENCES "skill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_option_id_foreign" FOREIGN KEY ("option_id") REFERENCES "poll_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_poll_id_foreign" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "formation_registration" ADD CONSTRAINT "formation_registration_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "formation_registration" ADD CONSTRAINT "formation_registration_session_id_foreign" FOREIGN KEY ("session_id") REFERENCES "formation_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_session_id_foreign" FOREIGN KEY ("session_id") REFERENCES "formation_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_company_id_foreign" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- CheckConstraint (issu du MCD, non représentable dans schema.prisma)
ALTER TABLE "message" ADD CONSTRAINT "message_sender_receiver_different" CHECK ("sender_id" <> "receiver_id");

-- CheckConstraint (validé applicativement aussi dans src/actions/media.ts)
ALTER TABLE "media" ADD CONSTRAINT "media_type_check" CHECK ("type" IN ('IMAGE', 'VIDEO'));
