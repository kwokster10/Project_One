INSERT INTO authors (name, bio) VALUES ("Jules", "A girl from PA now in NY."), ("aung", "An architect with a passion for great food.");


INSERT INTO pages (title, body, a_id) VALUES ("Antelope Canyon", "Antelope Canyon is a slot canyon in the American Southwest. It is located on Navajo land east of Page, Arizona. Antelope Canyon includes two separate, photogenic slot canyon sections, referred to individually as Upper Antelope Canyon or The Crack; and Antelope Canyon or The Corkscrew.", 1), ("Grand Canyon", "The __Grand Canyon__ (_Hopi_: Ongtupqa; _Yavapai_: Wi:kaʼi:la, _Spanish_: Gran Cañón), is a steep-sided canyon carved by the Colorado River in the state of Arizona in the United States. The Grand Canyon is 277 miles (446 km) long, up to 18 miles (29 km) wide and attains a depth of over a mile (6,000 feet or 1,800 meters). Nearly two billion years of Earth's geological history have been exposed as the Colorado River and its tributaries cut their channels through layer after layer of rock while the Colorado Plateau was uplifted. While the specific geologic processes and timing that formed the Grand Canyon are the subject of debate by geologists, recent evidence suggests that the Colorado River established its course through the canyon at least 17 million years ago. Since that time, the Colorado River continued to erode and form the canyon to its present-day configuration.", 2);


INSERT INTO sections (subtitle, sub_body, p_id, a_id) VALUES ("Access", "The road to Antelope Canyon is gated by the Navajo Nation and entry is restricted to guided tours led by authorized tour guides. Tours can be purchased in nearby Page, and range from $35 to $82 per person, depending on the time of the day and length of the tour.", 1, 1), ("Camping Fees", "  $5.00 per person, per night for anyone over the age of 6. Fees subject to change. You willl need to obtain a camping permit from one of the following locations listed below. Backcountry permit fees: $5.00 per person, per day.    These locations require these fees:  	 
  * Rainbow Bridge Trail    $12/person/night	 	 
  * Little Colorado River    $12/person/night	 	 
  * Bowl Canyon Recreation Area    $15/campsite (for 7 people)	 	 
  * San Juan River    $12/person/night	 	 
  * Monument Valley    $12/person/night  ", 1, 1);

-- INSERT INTO history (p_id, s_id, a_id, old_body) VALUES ();
