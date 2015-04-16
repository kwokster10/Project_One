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


// adding new authors to my authors table
app.post("/authors", function(req, res) {
	var a_name = req.body.name;
	var bio = req.body.bio;
	db.all("SELECT name FROM authors WHERE name=?;", a_name, function(err, rows) {
		if (rows.length > 0) {
			var not_unique = "That name is taken!"
			res.render("author_new.ejs", {a_name: a_name, bio: bio, not_unique: not_unique});
		} else {
			db.run("INSERT INTO authors (name, bio) VALUES (?, ?);", a_name, bio, function(err) {
				if (err) {
					throw err;
				} else {
					res.redirect("/authors");
				}
			});
		}
	});
});

// each authors individual page
app.get("/author/:a_id", function(req, res) {
	var a_id = req.params.a_id;
	db.get("SELECT * FROM authors WHERE a_id ="+a_id, function(err, rows) {
		db.all("SELECT * FROM pages WHERE a_id ="+a_id, function(err, rows1) {
			var bio = marked(rows.bio);
			res.render("author_show.ejs", {author: rows, bio: bio, pages: rows1});
		});
	});
});

// contents of site which should contain all titles of pages
app.get("/table_of_contents", function(req, res) {
	db.all("SELECT * FROM pages", function(err, rows) {
		res.render("pages.ejs", {pages : rows});
	});
});

// rendering what each page will look like
app.get("/table_of_contents/:p_id", function(req, res) {
	var p_id = req.params.p_id;
	db.all("SELECT * FROM pages WHERE p_id ="+p_id, function(err, rows) {
		db.all("SELECT * FROM sections WHERE p_id ="+p_id, function(err, rows1) {
			res.render("pages.ejs", {pages: rows, sections: rows1});
		});
	});
});


// rendering the form to add a new page
app.get("/pages/new", function(req, res) {
	db.all("SELECT * FROM authors;", function(err, rows) {
		res.render("page_new.ejs", {authors: rows});
	});
});

// inserting info into the pages table to add a page 
app.post("/pages", function(req, res) {
	var title = req.body.title;
	var p_body = req.body.p_body;
	db.run("INSERT INTO pages SET (title, body) VALUES (?, ?);", title, p_body, function(err) {
		res.redirect("/pages");
	});
});

// adding a section to a page
app.get("/page/:p_id/sections/new", function(req, res) {
	var p_id = req.params.p_id;
	db.all("SELECT * FROM pages WHERE p_id="+p_id, function(err, rows) {
		res.render("section_new.ejs", {title: title});
	});
});

// adding a section of a page to the database
app.post("/page/:p_id", function(req, res) {
	var p_id = req.params.p_id;
	db.run("INSERT INTO sections (subtitle, sub_body, p_id, a_id) VALUES p_id="+p_id, function(err) {
		res.redirect("/page/"+p_id);
	});
});

// to get to each park's individual full page
app.get("/page/:p_id", function(req, res) {
	var p_id = req.params.p_id;
	db.get("SELECT * FROM pages WHERE p_id="+p_id, function(err, rows) {
		db.all("SELECT * FROM sections WHERE p_id="+p_id, function(err, rows1) {
			res.render("page_show.ejs", {page: rows, sections: rows1});
		});
	});
});


// making the server listen on port 3000
app.listen(3000);
console.log("Listening on 3000");



