'use strict';

const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const expressSession = require('express-session');
const ConnectMongo = require('connect-mongo');

const mongoStore = ConnectMongo(expressSession);
const indexRouter = require('./routes/index');

const app = express();

// Setup view engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static(join(__dirname, 'public')));
app.use(
	sassMiddleware({
		src: join(__dirname, 'public'),
		dest: join(__dirname, 'public'),
		outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
		force: process.env.NODE_ENV === 'development',
		sourceMap: true
	})
);

app.use(express.static(join(__dirname, 'public')));

const authenticationRouter = require('./routes/authentication');

app.use('/', indexRouter);

// Catch missing routes and forward to error handler
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

app.use(
	expressSession({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: false,
		cookie: {
			maxAge: 15 * 24 * 60 * 60 * 1000
		},
		store: new mongoStore({
			mongooseConnection: mongoose.connection,
			ttl: 60 * 60
		})
	})
);

app.use((req, res, next) => {
	next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
	// Set error information, with stack only available in development
	res.locals.message = error.message;
	res.locals.error = req.app.get('env') === 'development' ? error : {};

	res.status(error.status || 500);
	res.render('error');
});

module.exports = app;
