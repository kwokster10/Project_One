DROP TABLE IF EXISTS;
CREATE TABLE authors (
	a_id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT,
	bio TEXT,
	p_id INTEGER
);

DROP TABLE IF EXISTS; 
CREATE TABLE pages (
	p_id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT,
	body TEXT,
	a_id INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER timestamp_update BEFORE UPDATE ON pages BEGIN UPDATE entries SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;
END;


DROP TABLE IF EXISTS; 
CREATE TABLE sections (
	s_id INTEGER PRIMARY KEY AUTOINCREMENT,
	subtitle TEXT, 
	sub_body TEXT,
	sub_image TEXT,
	sub_caption TEXT,
	p_id INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER timestamp_update BEFORE UPDATE ON pages BEGIN UPDATE entries SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;
END;

DROP TABLE IF EXISTS;
CREATE TABLE history (
	h_id INTEGER PRIMARY KEY,
	p_id INTEGER,
	s_id INTEGER,
	old_body TEXT,
	updated TEXT
);



