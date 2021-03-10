const bcrypt = require('bcryptjs');
const { expect } = require('chai');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('User Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  /**
   * @description Register a user and populate their fields
   **/
  describe(`POST /api/user`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['username', 'password', 'name'];

    requiredFields.forEach(field => {
      const registerAttemptBody = {
        username: 'test username',
        password: 'test password',
        name: 'test name',
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field];

        return supertest(app)
          .post('/api/user')
          .send(registerAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
      const userShortPassword = {
        username: 'test username',
        password: '1234567',
        name: 'test name',
      };
      return supertest(app)
        .post('/api/user')
        .send(userShortPassword)
        .expect(400, { error: `Password be longer than 8 characters` });
    });

    it(`responds 400 'Password be less than 72 characters' when long password`, () => {
      const userLongPassword = {
        username: 'test username',
        password: '*'.repeat(73),
        name: 'test name',
      };
      return supertest(app)
        .post('/api/user')
        .send(userLongPassword)
        .expect(400, { error: `Password be less than 72 characters` });
    });

    it(`responds 400 error when password starts with spaces`, () => {
      const userPasswordStartsSpaces = {
        username: 'test username',
        password: ' 1Aa!2Bb@',
        name: 'test name',
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordStartsSpaces)
        .expect(400, {
          error: `Password must not start or end with empty spaces`,
        });
    });

    it(`responds 400 error when password ends with spaces`, () => {
      const userPasswordEndsSpaces = {
        username: 'test username',
        password: '1Aa!2Bb@ ',
        name: 'test name',
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordEndsSpaces)
        .expect(400, {
          error: `Password must not start or end with empty spaces`,
        });
    });

    it(`responds 400 error when password isn't complex enough`, () => {
      const userPasswordNotComplex = {
        username: 'test username',
        password: '11AAaabb',
        name: 'test name',
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordNotComplex)
        .expect(400, {
          error: `Password must contain one upper case, lower case, number and special character`,
        });
    });

    it(`responds 400 'User name already taken' when username isn't unique`, () => {
      const duplicateUser = {
        username: testUser.username,
        password: '11AAaa!!',
        name: 'test name',
      };
      return supertest(app)
        .post('/api/user')
        .send(duplicateUser)
        .expect(400, { error: `Username already taken` });
    });

    describe(`Given a valid user`, () => {
      it(`responds 201, serialized user with no password`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        };
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body.name).to.eql(newUser.name);
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`);
          });
      });

      it(`stores the new user in db with bcryped password`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        };
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(res =>
            db
              .from('user')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username);
                expect(row.name).to.eql(newUser.name);
                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });

      it.skip(`inserts 1 habit for the new user`, () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          name: 'test name',
        };
        const expectedList = {
          habits: [
            {
              id: 1,
              name: 'Drink Water',
              description: 'Drink 6 glasses of water per day',
              //   user_id: user.id,
            },
            {
              id: 2,
              name: 'Exercise',
              description: 'Exercise 10 minutes per day',
              //   user_id: user.id,
            },
            {
              id: 3,
              name: 'Eat Healthy',
              description: 'Eat 3 servings of fruits/vegetables per day',
              //   user_id: user.id,
            },
            {
              id: 4,
              name: 'Ready for bed by 11pm',
              description: 'Complete evening routine and in bed by 11pm',
              //   user_id: user.id,
            },
          ],
        };
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .then(
            res => db.from('habits').select('*').where({ user_id: res.body.id })
            /*
            get habits for user that were inserted to db
            */
          )
          .then(dbLists => {
            console.log(dbLists, 'WHAT ARE THIS DB LIST');

            const dbHabits = dbLists.habits;

            expectedList.habits.forEach((habit, i) => {
              expect(dbHabits[w].id).to.eql(expectedHabit.id);
              expect(dbHabits[w].name).to.eql(expectedHabit.name);
              expect(dbHabits[w].description).to.eql(expectedHabit.description);
            });
          });
      });
    });
  });
});
