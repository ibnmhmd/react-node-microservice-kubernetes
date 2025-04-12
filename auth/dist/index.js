"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
app.set('port', process.env.PORT || 3000);
var PORT = app.get('port');
// Middleware
app.use(express.json());
// Routes
app.get('/', function (req, res) {
    res.send('Hello, world!');
});
app.get('/api/users/currentuser', function (req, res) {
    res.send('Hello, Current User!');
});
// Start the server
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
});
