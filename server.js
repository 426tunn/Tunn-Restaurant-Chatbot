const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const fs = require("fs");
const connecting = require('./handlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

require('./middlewares')(app, express, io);

io.on("connection", connecting);

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/orderItems", (req, res) => {
    fs.readFile("db/orderItems.json", (err, data) => {
        if (err) {
            return res.json(err.message);
        }
        const items = Buffer.from(data, "utf-8").toString();
        return res.json(items)
    });
})

app.get("/chat", (req, res) => {
    res.render("chat")
})

server.listen(process.env.PORT || 4303, () => {
    console.log(`listening at ${process.env.PORT}`);
})