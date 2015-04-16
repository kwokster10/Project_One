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
app.use(express.static(__dirname+"/public"));
// module for marked down files to become html
var marked = require("marked");


// redirecting to my homepage
app.get("/", function(req, res) {
	res.redirect("/main");
});

// my homepage or main page
app.get("/main", function(req, res) {
	res.render("index.ejs");
});

// page to teach people how to edit pages
app.get("/how_to_edit", function(req, res) {
	res.render("how_to.ejs");
});

// if they wanted to search the site for titles 
app.get("/search", function(req, res) {
	db.all("SELECT * FROM pages", function(err, rows) {
		// search through the titles with match and send the matches to /search page

	});
});

// all authors page
app.get("/authors", function(req, res) {
	db.all("SELECT * FROM authors;", function(err, rows) {
		res.render("authors.ejs", {authors : rows})
	});
});

// for new authors to register
app.get("/author/new", function(req, res) {
	res.render("author_new.ejs");
});

app.post("/authors", function(req, res) {
	var data = req.body;
	db.run("INSERT INTO authors SET (name, bio) VALUES (?, ?);" data.name, data.bio, function(err) {
		res.redirect("/auhors");
	});
})

// contents of site which should contain all titles of pages
app.get("/table_of_contents", function(req, res) {
	db.all("SELECT * FROM pages", function(err, rows) {
		res.render("pages.ejs", {pages : rows});
	});
});



// making the server listen on port 3000
app.listen(3000);
console.log("Listening on 3000");



