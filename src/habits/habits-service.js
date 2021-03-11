const HabitService = {
  getUserHabits(db, user_id) {
    return db.from('habits').select('*').where('habits.user_id', user_id);
  },
  getById(db, id) {
    return db.select('*').from('habits').where({ id }).first();
  },
  addHabit(db, newHabit, user_id) {
    return db
      .insert(newHabit)
      .into('habits')
      .where('user_id', user_id)
      .returning('*')
      .then(([habit]) => habit)
      .then(habit => HabitService.getById(db, habit.id));
  },
  removeHabit(db, habit_id) {
    return db('habits').where({ id: habit_id }).delete();
  },
  incrementCurrentStreak(db, habit) {
    return db
      .from('habits')
      .where({ id: habit.id })
      .update({
        current_streak: habit.current_streak + 1,
      });
  },
  resetCurrentStreak(db, habit) {
    return db.from('habits').where({ id: habit.id }).update({
      current_streak: 0,
    });
  },
  updateBestStreak(db, habit, newBest) {
    return db.from('habits').where({ id: habit.id }).update({
      best_streak: newBest,
    });
  },
};

module.exports = HabitService;
//every day at or after midnight, process previous days data
//select from habit_completion table where the completed date is >
//start of current day & < end of the current day
//increment or return to 0

//cron - to create an endpoint which processes habit completions
//cron - calls endpoint every day at midnight
