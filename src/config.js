module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://gilligan@localhost/habitstracker',
  TEST_DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://gilligan@localhost/habitstracker-test',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
};
