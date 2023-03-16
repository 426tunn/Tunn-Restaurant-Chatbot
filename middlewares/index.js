const session = require("express-session");
const { sessionConfig } = require("./../config");

const sessionMiddleware = session(sessionConfig);

module.exports = (app, express, io) => {
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(sessionMiddleware);

  io.engine.use(sessionMiddleware);
};
