const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');

const rateLimit = require('./middlewares/requestLimiter');

const routes = require('./routes/index');

const { PORT = 3000, MONGO_ADRESS = 'mongodb://localhost:27017/moviesdb' } = process.env;

const app = express();

app.use(cors({
  origin: 'https://diplom-pavel.nomoredomains.icu',
  credentials: true,
}));

app.use(rateLimit);

app.use(helmet());

app.use(routes);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next(err);
});

async function main() {
  await mongoose.connect(MONGO_ADRESS, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });
  await app.listen(PORT);
}

main();
