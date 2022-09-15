// const http = require('http');
const fs = require('fs');

// const myServer = http.createServer(function(req, res){
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/html");
//     res.end(<p>this is a response</p>);
// });

const express = require('express');

myServer.listen(8080); //change to 80 later (supposedly the standard)

//this entire file should be modified to accomodate express intead of http
// app.get ('/mainpage', function (req, res){}) is a middlewear
// res.sendFile("file.html") to display html??

//don't forget to specify the handlebars require("express-handlebars")
//app.engine('hbs', expressHandlebars({ extname: ".hbs"; })) something like that.
//response.render("file.hbs") or something like that.
//use different hbs for different pages?
//static middlewear to find public files for easy access?