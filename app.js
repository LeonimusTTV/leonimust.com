import 'dotenv/config';
import createError from 'http-errors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import requestIp from 'request-ip';
import indexRouter from './routes/index.js';
import expressLayouts from 'express-ejs-layouts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(requestIp.mw());

app.use(expressLayouts);

app.set('layout', 'layout');

// see which ip is comming into the website
app.use((req, res, next) => {
  let clientIp = req.clientIp;

  console.log('Raw Client IP:', clientIp);

  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const isDevelopment = req.app.get('env') === 'development';

  // set locals, only providing error details in development
  res.locals.message = isDevelopment ? err.message : (err.status === 404 ? 'Page Not Found' : 'Something went wrong');
  res.locals.error = isDevelopment ? err : {};
  res.locals.isDevelopment = isDevelopment;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
