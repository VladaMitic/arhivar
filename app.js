const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');

const cron = require('node-cron');
const AppError = require('./utils/appError');
const globalErrorHendler = require('./controllers/errorController');

const userRouter = require('./routers/userRoutes');
const processorRouter = require('./routers/processorRoutes');
const categoryRouter = require('./routers/categoryRoutes');
const paperRouter = require('./routers/paperRoutes');
const arhiveRouter = require('./routers/arhiveRoutes');
const User = require('./models/userModel');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.options('*', cors());

cron.schedule('0 0 0 * * *', async () => {
  const users = await User.find();
  users.forEach(async (user) => {
    if (user.role === 'user') {
      const today = Date.now();
      const newSubscriptionTime = parseInt(
        (user.subscriptionLeft - today) / (1000 * 60 * 60 * 24),
        10
      );
      const updatedTime = newSubscriptionTime || 0;
      await User.findByIdAndUpdate(
        user.id,
        { subscriptionTime: updatedTime },
        {
          new: true,
          runValidators: true,
        }
      );
    }
  });
});

//global Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: ["'self'", 'data:', 'blob:'],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 150,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP. Please try again in an hour.',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ['baseNumber', 'processor'],
  })
);

app.use(compression());

app.get((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/processor', processorRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/paper', paperRouter);
app.use('/api/v1/arhive', arhiveRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHendler);

module.exports = app;
