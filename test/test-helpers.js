const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  });
}

/**
 * create a knex instance connected to postgres
 * @returns {array} of user objects
 */
function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      name: 'Test user 1',
      password: 'password',
    },
    {
      id: 2,
      username: 'test-user-2',
      name: 'Test user 2',
      password: 'password',
    },
  ];
}

/**
 * generate fixtures of habits and words for a given user
 * @param {object} user - contains `id` property
 * @returns {Array(habits)} - arrays of habits and words
 */
function makeHabitsArray(user) {
  const habits = [
    {
      id: 1,
      name: 'Drink Water',
      description: 'Drink 6 glasses of water per day',
      user_id: user.id,
    },
    {
      id: 2,
      name: 'Exercise',
      description: 'Exercise 10 minutes per day',
      user_id: user.id,
    },
    {
      id: 3,
      name: 'Eat Healthy',
      description: 'Eat 3 servings of fruits/vegetables per day',
      user_id: user.id,
    },
    {
      id: 4,
      name: 'Ready for bed by 11pm',
      description: 'Complete evening routine and in bed by 11pm',
      user_id: user.id,
    },
  ];

  return habits;
}

/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

/**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
        "habits",
        "user"`
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE habits_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE user_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('habits_id_seq', 0)`),
          trx.raw(`SELECT setval('user_id_seq', 0)`),
        ])
      )
  );
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db.transaction(async trx => {
    await trx.into('user').insert(preppedUsers);

    await trx.raw(`SELECT setval('user_id_seq', ?)`, [
      users[users.length - 1].id,
    ]);
  });
}

/**
 * seed the databases with words and update sequence counter
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @param {array} habits - array of habits objects for insertion
 * @returns {Promise} - when all tables seeded
 */
async function seedUsersHabits(db, users, habits) {
  await seedUsers(db, users);
}

module.exports = {
  makeKnexInstance,
  makeHabitsArray,
  makeUsersArray,
  makeAuthHeader,
  cleanTables,
  seedUsers,
};
