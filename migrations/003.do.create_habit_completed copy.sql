CREATE TABLE "user_habit" (
  "id" SERIAL PRIMARY KEY,
  "habit_id" INTEGER REFERENCES "habits"(id),
  "date_completed" TIMESTAMPTZ DEFAULT now() NOT NULL,
    ON DELETE CASCADE NOT NULL
);