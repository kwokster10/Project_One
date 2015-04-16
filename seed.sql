INSERT INTO authors (name, bio) VALUES ("Jules", "A girl from PA now in NY."), ("aung", "An architect with a passion for great food.");


INSERT INTO pages (title, body, a_id) VALUES ("Antelope Canyon", "Antelope Canyon is a slot canyon in the American Southwest. It is located on Navajo land east of Page, Arizona. Antelope Canyon includes two separate, photogenic slot canyon sections, referred to individually as Upper Antelope Canyon or The Crack; and Antelope Canyon or The Corkscrew.", 1);


INSERT INTO sections (subtitle, sub_body, p_id, a_id) VALUES ("Access", "The road to Antelope Canyon is gated by the Navajo Nation and entry is restricted to guided tours led by authorized tour guides. Tours can be purchased in nearby Page, and range from $35 to $82 per person, depending on the time of the day and length of the tour.", 1, 1);


-- INSERT INTO history (
-- 	h_id INTEGER PRIMARY KEY,
-- 	p_id INTEGER,
-- 	s_id INTEGER,
-- 	old_body TEXT,
-- 	updated_on TEXT,
-- 	subscriber_email TEXT
-- );
