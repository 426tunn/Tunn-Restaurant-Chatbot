var session = require("express-session");
const MongoStore = require('connect-mongo')
require('dotenv').config()

const { sessionConfig } = require("./../config");

sessionConfig.store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  dbName: 'test-app'
}) 

const sessionMiddleware = session(sessionConfig);

module.exports = (app, express, io) => {
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(sessionMiddleware);

  io.engine.use(sessionMiddleware);
};
