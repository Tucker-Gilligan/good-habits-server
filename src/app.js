const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./middleware/errorHandler');
const authRouter = require('./auth/auth-router');
const userRouter = require('./user/user-router');
const habitsRouter = require('./habits/habits-router');

const app = express();

app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
  })
);
app.use(cors());
app.use(helmet());

app.use('/api/auth', authRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/user', userRouter);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

module.exports = app;
