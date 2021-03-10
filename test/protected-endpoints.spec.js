const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const [testUser] = testUsers;
  const [testhabits, testWords] = helpers.makehabitsAndWords(testUser);

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach('insert users, habits and words', () => {
    return helpers.seedUsershabitsWords(db, testUsers, testhabits, testWords);
  });

  const protectedEndpoints = [
    {
      name: 'GET /api/habit',
      path: '/api/habit',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/habit/head',
      path: '/api/habit/head',
      method: supertest(app).get,
    },
    {
      name: 'POST /api/habit/guess',
      path: '/api/habit/guess',
      method: supertest(app).post,
    },
    {
      name: 'PUT /api/auth/token',
      path: '/api/auth/token',
      method: supertest(app).put,
    },
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return endpoint
          .method(endpoint.path)
          .set(
            'Authorization',
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: `Unauthorized request` });
      });

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'user-not-existy', id: 1 };
        return endpoint
          .method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });
    });
  });
});
