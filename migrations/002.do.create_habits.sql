CREATE TABLE "habits" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "current_streak" SMALLINT DEFAULT 0,
  "best_streak" SMALLINT DEFAULT 0,
  "date_completed" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "user_id" INTEGER REFERENCES "user"(id)
    ON DELETE CASCADE NOT NULL
);