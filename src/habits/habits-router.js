const express = require('express');
const habitsRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const HabitsService = require('./habits-service');

const serializeHabit = habit => ({
  id: habit.id,
  name: habit.name,
  description: habit.description,
  current_streak: habit.current_streak,
  best_streak: habit.best_streak,
  // date_completed: habit.date_completed,
  user_id: habit.user_id,
});

habitsRouter
  .use(requireAuth)
  .route('/')
  .get((req, res, next) => {
    HabitsService.getUserHabits(req.app.get('db'), req.user.id)
      .then(habits => {
        if (!habits) {
          return res.json({
            error:
              'looks like you dont have any habits, create one to get started',
          });
        } else {
          return res.json(habits.map(serializeHabit));
        }
      })
      .catch(next);
  })
  //this post endpoint will create a new habit
  .post(jsonBodyParser, (req, res, next) => {
    const { name, description, user_id } = req.body;
    const newHabit = {
      name,
      description,
      current_streak: 0,
      best_streak: 0,
      // date_completed: null,
      user_id: req.user.id,
    };

    if (!name) {
      return res
        .status(400)
        .json({ error: { message: `Missing name in request body` } });
    }
    if (!description) {
      return res
        .status(400)
        .json({ error: { message: `Missing description in request body` } });
    }

    HabitsService.addHabit(req.app.get('db'), newHabit)
      .then(habit => {
        res.status(201).location('/').json(habit);
      })
      .catch(next);
  });

//next endpoint will
//---mark a habit as complete
//---increment the current_streak
//---increment best_streak if applicable
//---place timestamp on date_completed

module.exports = habitsRouter;
