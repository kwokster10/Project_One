// requiring necessary modules

// module for express server
var express = require("express");
// assigning the var app to all the methods of express
var app = express();
// module to use template tags
var ejs = require("ejs");
// setting the app to look in views for any ejs files referenced
app.set("view_engine", "ejs");
// parses the body of the request from app so it can be read
var bodyParser = require("body-parser");
// lets app know to use this module
app.use(bodyParser.urlencoded({extended: false}));
// module to override put and delete 
var metOverride = require("method-override");
// giving app the ability to use the method-override module
app.use(metOverride("_method"));
// requring the sqlite3 so be can use sql commands and db
var sqlite3 = require("sqlite3").verbose();
// requiring the db that holds tables
var db = new sqlite3.Database("wiki.db");
// so that my css stylesheet will be connected 
app.use(express.static("public"));
// module for marked down files to become html
var marked = require("marked");

app.get("/", function(req, res) {
	res.redirect("/main");
});

app.get("/main", function(req, res) {
	res.render("index.ejs");
});

app.get("/how_to_edit", function(req, res) {
	res.render("how_edit.ejs");
});

app.get("/search", function(req, res) {
	db.all("SELECT * FROM pages", function(err, rows) {
		// search through the titles with match and send the matches to /search page

	});
});

app.get("/authors", function(req, res) {
	db.all("SELECT * FROM authors;", function(err, rows)) {
		res.render("authors.ejs", {authors : rows})
	});
});

app.get("/author/new", function(req, res) {
	res.render("author_new.ejs");
});

app.get("/table_of_contents", function(req, res) {
	db.all("SELECT * FROM pages", function(err, rows) {
		res.render("pages.ejs", {pages : rows});
	});
});



// making the server listen on port 3000
app.listen(3000);
console.log("Listening on 3000");



