const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize'),
  xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middlewares
// serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security http header
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    // contentSecurityPolicy: {
    //   directives: {
    //     defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
    //     baseUri: ["'self'"],
    //     fontSrc: ["'self'", 'https:', 'data:'],
    //     scriptSrc: [
    //       "'self'",
    //       'https:',
    //       'http:',
    //       'blob:',
    //       'https://*.mapbox.com',
    //       'https://js.stripe.com',
    //       'https://m.stripe.network',
    //       'https://*.cloudflare.com',
    //     ],
    //     frameSrc: ["'self'", 'https://js.stripe.com'],
    //     objectSrc: ["'none'"],
    //     styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    //     workerSrc: [
    //       "'self'",
    //       'data:',
    //       'blob:',
    //       'https://*.tiles.mapbox.com',
    //       'https://api.mapbox.com',
    //       'https://events.mapbox.com',
    //       'https://m.stripe.network',
    //     ],
    //     childSrc: ["'self'", 'blob:'],
    //     imgSrc: ["'self'", 'data:', 'blob:'],
    //     formAction: ["'self'"],
    //     connectSrc: [
    //       "'self'",
    //       "'unsafe-inline'",
    //       'data:',
    //       'blob:',
    //       'https://*.stripe.com',
    //       'https://*.mapbox.com',
    //       'https://*.cloudflare.com/',
    //       'https://bundle.js:*',
    //       'ws://127.0.0.1:*/',
    //     ],
    //     upgradeInsecureRequests: [],
    //   },
    // },
  })
);
// console.log(process.env.NODE_ENV);

//place it here for now to remove Refused to connect to 'ws://127.0.0.1:****/' because it violates the following Content Security Policy directive: "default-src 'self'". Note that 'connect-src' was not explicitly set, so 'default-src' is used as a fallback., not sure if will work okay
//this only works for dev DO NOT DEPLOY LIKE THAT TO PROD)
app.use((req, res, next) => {
  res.set('Content-Security-Policy', 'connect-src *');
  next();
});

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// body parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Date sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 2)route handlers

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours/', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3) routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // (err.status = 'fail'), (err.statusCode = 404);

  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);

//4) restart server
module.exports = app;
