BEGIN;

TRUNCATE
  "habits",
  "user",
  "user_habit";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (1,
    'admin',
    'Tucker',
    'Tucker'
  ), (2, 'test', 'test', 'test'), (3, 'user1', 'user1', '$2a$12$wjdAjLNn1XH9YOTQcX5btuZOj/TXSQ2xjm66DKNq2XzpQUIVAEL1S');

INSERT INTO "habits" ("id", "name", "description", "current_streak", "best_streak", "user_id")
VALUES
  (1, 'Drink Water', 'drink 6 glasses of water per day', 6, 20, 3),
  (2, 'Exercise', 'exercise 10min per day', 2, 10, 3),
  (3, 'Bedtime Routine', 'Finish bedtime routine and be in bed by 11pm', 6, 10, 3),
  (4, 'Play Guitar', 'Play guitar 10min/day', 10, 15, 3),
  (5, 'Journal', 'Journal for 5 minutes/day', 0, 2, 3),
  (6, 'Spend Time Outside', 'spend at least 15 minutes outside', 15, 15, 3);

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('habits_id_seq', (SELECT MAX(id) from "habits"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));
SELECT setval('user_habit_id_seq', (SELECT MAX(id) from "user_habit"));

COMMIT;
