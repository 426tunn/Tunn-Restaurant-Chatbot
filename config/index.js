require('dotenv').config();

ONEDAY = 1000 * 60 * 60 * 24;
const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    proxy: true,
    saveUninitialized: true,
    cookie: { httpOnly: true,  secure: true, maxAge: ONEDAY },
  };

module.exports = {
    sessionConfig
}