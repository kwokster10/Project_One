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

// sendgrid api name and key
var secrets = require("./secrets.json");
var apiName = secrets["apiName"];
var apiKey = secrets["apiKey"];

var sendgrid  = require('sendgrid')(apiName, apiKey);
var email = new sendgrid.Email({
  bcc: "subscriber@email.com",
  from: "anonymous",
  subject: "Title of Updated Page",
  text: "Check out the new changes to page"
});

// sendgrid.send(email, function(err, json) {
//   if (err) { return console.error(err); }
//   console.log(json);
// });

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

app.get("/error", function(req, res) {
	res.render("error.ejs");
});

// if they wanted to search the site for titles 
app.get("/search", function(req, res) {
	var keyword = req.query.search.toUpperCase();
	db.all("SELECT * FROM pages WHERE title like '%"+keyword+"%';", function(err, rows) {
		db.all("SELECT * FROM sections WHERE subtitle like '%"+keyword+"%';", function(err, rows1) {
			db.all("SELECT * FROM pages WHERE body like '%"+keyword+"%';", function(err, rows2) {
				db.all("SELECT * FROM sections WHERE sub_body like '%"+keyword+"%';", function(err, rows3) {
					res.render("search.ejs", {search: keyword.toLowerCase(), pages: rows, sections: rows1, page_body: rows2, section_body: rows3});
				});
			});
		});
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

// adding new authors to my authors table making sure all of the ids are unique
app.post("/authors", function(req, res) {
	var a_name = req.body.name;
	var bio = req.body.bio;
	db.all("SELECT name FROM authors WHERE name=?;", a_name, function(err, rows) {
		if (rows.length > 0) {
			var not_unique = "That name is taken!"
			res.render("author_new.ejs", {a_name: a_name, bio: bio, not_unique: not_unique});
		} else {
			db.run("INSERT INTO authors (name, bio) VALUES (?, ?);", a_name.trim(), bio, function(err) {
				if (err) {
					res.redirect("error.ejs");
				} else {
					res.redirect("/authors");
				}
			});
		}
	});
});

// each authors individual page
app.get("/author/:a_id", function(req, res) {
	var a_id = parseInt(req.params.a_id);
	db.get("SELECT * FROM authors WHERE id = ?;", a_id, function(err, rows) {
		db.all("SELECT * FROM pages WHERE a_id = ?;", a_id, function(err, rows1) {
			var bio = marked(rows.bio);
			res.render("author_show.ejs", {author: rows, bio: bio, pages: rows1});
		});
	});
});

// rendering the author edit page
app.get("/author/:a_id/edit", function(req, res) {
	var a_id = parseInt(req.params.a_id);
	db.get("SELECT * FROM authors WHERE a_id= ?;", a_id, function(err, rows) {
		res.render("author_edit.ejs", {author: rows});
	});
});

// updating the specific author 
app.put("/author/:a_id", function(req, res) {
	var a_id = parseInt(req.params.a_id);
	db.run("UPDATE authors SET name = ?, bio = ? WHERE a_id =?;", req.body.name.trim(), req.body.bio, a_id, function(err) {
		if (err) {
			res.redirect("error.ejs");
		} else {
			res.redirect("/authors");
		}
	});
});

// contents of site which should contain all titles of pages
app.get("/table_of_contents", function(req, res) {
	db.all("SELECT * FROM pages", function(err, rows) {
		res.render("pages.ejs", {pages : rows});
	});
});

// rendering the form to add a new page
app.get("/pages/new", function(req, res) {
	db.all("SELECT * FROM authors;", function(err, rows) {
		res.render("page_new.ejs", {authors: rows});
	});
});

// inserting into the contents table to add a new page accounting for [[ ]] notation
app.post("/table_of_contents", function(req, res) {
	var title = req.body.title;
	var p_body = req.body.p_body;
	var a_id = req.body.a_id;
	if (req.body.p_body.indexOf("[[") != -1) {
		var first = req.body.p_body.indexOf("[[");
		var second = req.body.p_body.indexOf("]]");
		replacer(req.body.p_body, first, db);
		var total;
		function replacer(string, start, db) {
		    var substr = string.substr(start+2, second-start-2);
		    db.get("SELECT id FROM pages WHERE title = ?;", substr, function(err, rows) {
		    	if (rows != undefined) {
				    var ahref = "["+substr+"](/page/"+rows.id+")";
				    total = string.slice(0, start) + ahref + string.slice(second+2, string.length);
				    if (total.indexOf("[[", first+2) != -1) {
				    	first = total.indexOf("[[", first+2)
				    	second = total.indexOf("]]", second+2);
				        replacer(total, total.indexOf("[[", first), db);
				    } else {
				         db.run("INSERT INTO pages (title, body, a_id) VALUES (?, ?, ?);", title.trim(), total, a_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/table_of_contents");
							}
						});
				    }
				// was trying to get it to skip any misspellings, but this doesn't work
				} else if (total != undefined && total.indexOf("[[", first+2) !== -1) {
					first = total.indexOf("[[", first+2);
					second = total.indexOf("]]", second+2);
				    replacer(total, first, db);
				} else {
					if (total != undefined) {
						db.run("INSERT INTO pages (title, body, a_id) VALUES (?, ?, ?);", title.trim(), total, a_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/table_of_contents");
							}
						});
					} else {
						db.run("INSERT INTO pages (title, body, a_id) VALUES (?, ?, ?);", title.trim(), p_body, a_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/table_of_contents");
							}
						});
					}
				}
		    });
		};	
	} else {
		db.run("INSERT INTO pages (title, body, a_id) VALUES (?, ?, ?);", title.trim(), p_body, a_id, function(err) {
			if (err) {
				res.redirect("error.ejs");
			} else {
				res.redirect("/table_of_contents");
			}
		});
	}
});

// rendering main page edit page
app.get("/page/:p_id/edit", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	db.all("SELECT * FROM authors;", function(err, rows) {
		db.get("SELECT * FROM pages WHERE id = ?;", p_id, function(err, rows1) {
			res.render("page_edit.ejs", {authors: rows, page: rows1});
		});
	});
});

// updating a main page checking for [[ ]]
app.put("/page/:p_id", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	// still need to add history and not change a_id of original
	if (req.body.p_body.indexOf("[[") != -1) {
		var first = req.body.p_body.indexOf("[[");
		var second = req.body.p_body.indexOf("]]");
		replacer(req.body.p_body, first, db);
		var total;
		function replacer(string, start, db) {
		    var substr = string.substr(start+2, second-start-2);
		    db.get("SELECT id FROM pages WHERE title = ?;", substr, function(err, rows) {
		    	if (rows != undefined) {
				    var ahref = "["+substr+"](/page/"+rows.id+")";
				    total = string.slice(0, start) + ahref + string.slice(second+2, string.length);
				    if (total.indexOf("[[", first+2) != -1) {
				    	first = total.indexOf("[[", first+2)
				    	second = total.indexOf("]]", second+2);
				        replacer(total, total.indexOf("[[", first), db);
				    } else {
				         db.run("UPDATE pages SET title = ?, body = ?, a_id = ? WHERE id = ?;", req.body.title.trim(), total, req.body.a_id, p_id, function(err) {
							if (err) {
								throw err;
							} else {
								res.redirect("/table_of_contents");
							}
						});
				    }
				// was trying to get it to skip any misspellings, but this doesn't work
				} else if (total != undefined && total.indexOf("[[", first+2) !== -1) {
					first = total.indexOf("[[", first+2);
					second = total.indexOf("]]", second+2);
				    replacer(total, first, db);
				} else {
					if (total != undefined) {
						db.run("UPDATE pages SET title = ?, body = ?, a_id = ? WHERE id = ?;", req.body.title.trim(), total, req.body.a_id, p_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/table_of_contents");
							}
						});
					} else {
						db.run("UPDATE pages SET title = ?, body = ?, a_id = ? WHERE id = ?;", req.body.title.trim(), req.body.p_body, req.body.a_id, p_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/table_of_contents");
							}
						});
					}
				}
		    });
		};	
	} else {
		db.run("UPDATE pages SET title = ?, body = ?, a_id = ? WHERE id = ?;", req.body.title.trim(), req.body.p_body, req.body.a_id, p_id, function(err) {
			if (err) {
				res.redirect("error.ejs");
			} else {
				res.redirect("/table_of_contents");
			}
		});
	}
});

// form to put a section to a page
app.get("/page/:p_id/sections/new", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	db.all("SELECT * FROM authors;", function(err, rows) {
		db.get("SELECT * FROM pages WHERE id = ?;", p_id, function(err, rows1) {
			res.render("section_new.ejs", {page: rows1, authors: rows});
		});
	});
});

// to get to each park's individual full page making sure to convert md to html
app.get("/page/:p_id", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	db.get("SELECT * FROM pages WHERE id= ?;", p_id, function(err, rows) {
		var p_body = marked(rows.body);
		db.all("SELECT * FROM sections WHERE p_id = ?;", p_id, function(err, rows1) {
			rows1.map(function(obj) {
				obj.sub_body = marked(obj.sub_body);
			});
			res.render("page_show.ejs", {page: rows, sections: rows1, p_body: p_body});
		});
	});
});

// adding a section of a page to the database checking for [[ ]]
app.post("/page/:p_id", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	var a_name = req.body.author_name;
	db.get("SELECT id FROM authors WHERE name = ?;", a_name, function(err, rows) {
		var a_id = rows.id;
		if (err) {
			res.redirect("error.ejs");
		} else if (req.body.sub_body.indexOf("[[") != -1) {
			var first = req.body.sub_body.indexOf("[[");
			var second = req.body.sub_body.indexOf("]]");
			replacer(req.body.sub_body, first, db);
			function replacer(string, start, db) {
			    var substr = string.substr(start+2, second-start-2);
			    db.get("SELECT id FROM pages WHERE title = ?;", substr, function(err, rows) {
			    	if (rows != undefined) {
					    var ahref = "["+substr+"](/page/"+rows.id+")";
					    total = string.slice(0, start) + ahref + string.slice(second+2, string.length);
					    if (total.indexOf("[[", first+2) != -1) {
					    	first = total.indexOf("[[", first+2)
					    	second = total.indexOf("]]", second+2);
					        replacer(total, total.indexOf("[[", first), db);
					    } else {
					         db.run("INSERT INTO sections (subtitle, sub_body, p_id, a_id) VALUES (?, ?, ?, ?);", req.body.subtitle, total, p_id, a_id, function(err) {
								if (err) {
									res.redirect("error.ejs");
								} else {
									res.redirect("/page/"+p_id);
								}
							});
					    }
					// was trying to get it to skip any misspellings, but this doesn't work
					} else if (total != undefined && total.indexOf("[[", first+2) !== -1) {
						first = total.indexOf("[[", first+2);
						second = total.indexOf("]]", second+2);
					    replacer(total, first, db);
					} else {
						if (total != undefined) {
							db.run("INSERT INTO sections (subtitle, sub_body, p_id, a_id) VALUES (?, ?, ?, ?);", req.body.subtitle, total, p_id, a_id, function(err) {
								if (err) {
									res.redirect("error.ejs");
								} else {
									res.redirect("/page/"+p_id);
								}
							});
						} else {
							db.run("INSERT INTO sections (subtitle, sub_body, p_id, a_id) VALUES (?, ?, ?, ?);", req.body.subtitle, req.body.sub_body, p_id, a_id, function(err) {
								if (err) {
									res.redirect("error.ejs");
								} else {
									res.redirect("/page/"+p_id);
								}
							});
						}
					}
			    });
			};	
		} else {
			db.run("INSERT INTO sections (subtitle, sub_body, p_id, a_id) VALUES (?, ?, ?, ?);", req.body.subtitle, req.body.sub_body, p_id, a_id, function(err) {
				if (err) {
					res.redirect("error.ejs");
				} else {
					res.redirect("/page/"+p_id);
				}
			});
		}
	});
});

// getting form to update a section 
app.get("/page/:p_id/section/:s_id/edit", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	var s_id = parseInt(req.params.s_id);
	db.all("SELECT * FROM authors;", function(err, rows) {
		db.get("SELECT * FROM pages WHERE id= ?;", p_id, function(err, rows1) {
			db.get("SELECT * FROM sections WHERE id = ?;", s_id, function(err, rows2) {
				res.render("section_edit.ejs", {authors: rows, page: rows1, section: rows2})
			});
		});
	});
});

// editing a section and updating the database checking for [[ ]]
app.put("/page/:p_id/section/:s_id", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	var s_id = parseInt(req.params.s_id);
	var a_id = req.body.a_id;
	// still need to add history and not change a_id of original 
	if (req.body.sub_body.indexOf("[[") != -1) {
		var first = req.body.sub_body.indexOf("[[");
		var second = req.body.sub_body.indexOf("]]");
		replacer(req.body.sub_body, first, db);
		function replacer(string, start, db) {
		    var substr = string.substr(start+2, second-start-2);
		    db.get("SELECT id FROM pages WHERE title = ?;", substr, function(err, rows) {
		    	if (rows != undefined) {
				    var ahref = "["+substr+"](/page/"+rows.id+")";
				    total = string.slice(0, start) + ahref + string.slice(second+2, string.length);
				    if (total.indexOf("[[", first+2) != -1) {
				    	first = total.indexOf("[[", first+2)
				    	second = total.indexOf("]]", second+2);
				        replacer(total, total.indexOf("[[", first), db);
				    } else {
				         db.run("UPDATE sections SET subtitle = ?, sub_body = ?, p_id = ?, a_id = ? WHERE id = ?;", req.body.subtitle, total, p_id, a_id, s_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/page/"+p_id);
							}
						});
				    }
				// was trying to get it to skip any misspellings, but this doesn't work
				} else if (total != undefined && total.indexOf("[[", first+2) !== -1) {
					first = total.indexOf("[[", first+2);
					second = total.indexOf("]]", second+2);
				    replacer(total, first, db);
				} else {
					if (total != undefined) {
						db.run("UPDATE sections SET subtitle = ?, sub_body = ?, p_id = ?, a_id = ? WHERE id = ?;", req.body.subtitle, total, p_id, a_id, s_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/page/"+p_id);
							}
						});
					} else {
						db.run("UPDATE sections SET subtitle = ?, sub_body = ?, p_id = ?, a_id = ? WHERE id = ?;", req.body.subtitle, req.body.sub_body, p_id, a_id, s_id, function(err) {
							if (err) {
								res.redirect("error.ejs");
							} else {
								res.redirect("/page/"+p_id);
							}
						});
					}
				}
		    });
		};	
	} else {
		db.run("UPDATE sections SET subtitle = ?, sub_body = ?, p_id = ?, a_id = ? WHERE id = ?;", req.body.subtitle, req.body.sub_body, p_id, a_id, s_id, function(err) {
			if (err) {
				res.redirect("error.ejs");
			} else {
				res.redirect("/page/"+p_id);
			}
		});
	}
});

// the discussion form 
app.get("/page/:p_id/discussions/new", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	db.get("SELECT * FROM pages WHERE id = ?;", p_id, function(err, rows) {
		res.render("discussion_new.ejs", {page: rows});
	});
});

// showing the discussions for each page  
app.get("/page/:p_id/discussions", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	db.get("SELECT * FROM pages WHERE id = ?;", p_id, function(err, rows) {
		db.all("SELECT * FROM discussions WHERE p_id = ?;", p_id, function(err, rows1) {
			rows1.map(function(obj) {
				obj.d_body = marked(obj.d_body);
			}); 
			db.all("SELECT replies.id, replies.r_name, replies.r_body, replies.d_id, replies.created_at FROM replies INNER JOIN discussions ON replies.d_id = discussions.id WHERE discussions.p_id = ?;", p_id, function(err, rows2) {
				rows2.map(function(obj1) {
					obj1.r_body = marked(obj1.r_body);
				}); 
				res.render("discussion_show.ejs", {page: rows, discussions: rows1, replies: rows2});
			});
		});
	});
});

// posting the discussions 
app.post("/page/:p_id/discussions/add", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	db.run("INSERT INTO discussions (d_name, d_title, d_body, p_id) VALUES (?, ?, ?, ?);", req.body.d_name, req.body.d_title, req.body.d_body, p_id, function(err) {
		res.redirect("/page/"+p_id+"/discussions");
	});
});

// posting a reply
app.post("/page/:p_id/discussion/:d_id/replies", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	var d_id = parseInt(req.params.d_id);
	db.run("INSERT INTO replies (r_name, r_body, d_id) VALUES (?, ?, ?);", req.body.r_name, req.body.r_body, d_id, function(err) {
		res.redirect("/page/"+p_id+"/discussions");
	});
});

// deleting a specific reply
app.delete("/page/:p_id/discussion/:d_id/reply/:r_id", function(req, res){
	var p_id = parseInt(req.params.p_id);
	var d_id = parseInt(req.params.d_id);
	var r_id = parseInt(req.params.r_id);
	db.run("DELETE FROM replies WHERE id = ?;", r_id, function(err) {
		if (err) {
			res.redirect("error.ejs");
		} else{
			console.log("does it reach here?")
			res.redirect("/page/"+p_id+"/discussions");
		}
	});
});

// deleting a discussion topic
app.delete("/page/:p_id/discussion/:d_id", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	var d_id = parseInt(req.params.d_id);
	db.run("DELETE FROM discussions WHERE id = ?;", d_id, function(err) {
		db.run("DELETE FROM replies WHERE d_id = ?;", d_id, function(err) {
			if (err) {
				res.redirect("error.ejs");
			} else {
				res.redirect("/page/"+p_id+"/discussions");
			}
		});
	});
});

// delete a page which deletes all of it's articles, discussions and replies
app.delete("/page/:p_id", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	db.run("DELETE FROM pages WHERE id = ?;", p_id, function(err) {
		db.run("DELETE FROM sections WHERE p_id = ?;", p_id, function(err) {
			db.get("SELECT id FROM discussions WHERE p_id = ?;", p_id, function(err, rows) {
				db.run("DELETE FROM replies WHERE d_id = ?;", rows.id, function(err) {
					db.run("DELETE FROM discussions WHERE p_id = ?;", p_id, function(err) {
						if (err) {
							res.redirect("error.ejs"); 
						} else {
							res.redirect("/table_of_contents");
						}
					});
				});
			});
		});
		
	});
});

// delete a section
app.delete("/page/:p_id/section/:s_id", function(req, res) {
	var p_id = parseInt(req.params.p_id);
	var s_id = parseInt(req.params.s_id);
	db.run("DELETE FROM sections WHERE id = ?;", s_id, function(err) {
		if (err) {
			res.redirect("error.ejs"); 
		} else {
			res.redirect("/page/"+p_id);
		}
	});
});

// in case they try to go somewhere else
app.get("/:somethingelse", function(req, res) {
	res.redirect("error.ejs");
});

// in case they try to go somewhere else
app.get("/:somethingelse/:somewhereElse", function(req, res) {
	res.redirect("error.ejs");
});

// in case they try to go somewhere else
app.get("/:somethingelse/:somewhereElse/:somewhereOther", function(req, res) {
	res.redirect("error.ejs");
});


// making the server listen on port 3000
app.listen(3000);
console.log("Listening on 3000");





