const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const query1Router = require('./query1.js');
const query2Router = require('./query2.js');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/query1', query1Router);
app.use('/api/query2', query2Router);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, 'Route not found'));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;