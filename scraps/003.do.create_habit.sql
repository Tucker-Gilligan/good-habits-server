CREATE TABLE "habit" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "current_streak" TEXT NOT NULL,
  "date_completed" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "habit_id" INTEGER REFERENCES "habits"(id)
    ON DELETE CASCADE NOT NULL,
);

ALTER TABLE "habits"
  ADD COLUMN "habit_id" INTEGER REFERENCES "habit"(id)
    ON DELETE SET NULL;
