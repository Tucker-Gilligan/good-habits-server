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
  date_completed: habit.date_completed,
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
  });

// habitsRouter.use(requireAuth).use(async (req, res, next) => {
//   try {
//     const habit = await HabitsService.getUserHabits(
//       req.app.get('db'),
//       req.user.id
//     );

//     if (!habit)
//       return res.status(404).json({
//         error: `You don't have any habits yet, create one to get started!`,
//       });

//     req.habit = habit;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = habitsRouter;
