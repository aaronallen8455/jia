USE `jia`;

CREATE TABLE `users` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(45) NOT NULL,
    `last_name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(80) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `type` CHAR(1) NULL,
    `validation_code` CHAR(12) NOT NULL,
    `ip` VARCHAR(45) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC),
    INDEX `login` (`email` ASC, `pass` ASC)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `instr` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `profiles` (
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `instr_id` TINYINT UNSIGNED NULL,
    `bio` TEXT NULL,
    `pic` VARCHAR(100) NULL,
    `links` TINYTEXT NULL,
    PRIMARY KEY (`user_id`),
    FULLTEXT (`bio`),
    CONSTRAINT `fk_user_id`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_instr_id`
        FOREIGN KEY (`instr_id`)
        REFERENCES `instr` (`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;
-- make a MyIsam dupe for searching in mysql 5.5
CREATE TABLE `profiles_isam` (
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `bio` TEXT NULL,
    FULLTEXT (`bio`)
) ENGINE = MyISAM;

CREATE TABLE `profiles_secondaryinstr` (
    `profile_id` SMALLINT UNSIGNED NOT NULL,
    `instr_id` TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (`profile_id`, `instr_id`),
    CONSTRAINT `fk_secinstrprofile_id` FOREIGN KEY (`profile_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_secinstr_id` FOREIGN KEY (`instr_id`) REFERENCES `instr` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `events` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `venue` VARCHAR(80) NOT NULL,
    `date` DATE NOT NULL,
    `start_time` CHAR(4) NOT NULL,
    `end_time` CHAR(4) NULL,
    `desc` TEXT NULL,
    `title` VARCHAR(80) NOT NULL,
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `band` TEXT NULL,
    PRIMARY KEY (`id`),
    -- FULLTEXT (`title`, `desc`, `band`, `venue`),
    CONSTRAINT `fk_euser_id`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;
-- make a MyIsam dupe for searching in mysql 5.5
CREATE TABLE `events_isam` (
    `id` INT UNSIGNED NOT NULL,
    `venue` VARCHAR(80) NOT NULL,
    `desc` TEXT NULL,
    `title` VARCHAR(80) NOT NULL,
    `band` TEXT NULL,
    FULLTEXT (`title`, `desc`, `band`, `venue`)
) ENGINE = MyISAM;

CREATE TABLE `venues` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `desc` TEXT NOT NULL,
    `pic` VARCHAR(100) NULL,
    `links` TINYTEXT NULL,
    PRIMARY KEY (`id`),
    -- FULLTEXT (`name`, `desc`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;
-- make a MyIsam dupe for searching in mysql 5.5
CREATE TABLE `venues_isam` (
    `id` SMALLINT UNSIGNED NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `desc` TEXT NOT NULL,
    FULLTEXT (`name`, `desc`)
) ENGINE = MyISAM;

CREATE TABLE `rm_tokens` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `selector` CHAR(12) NOT NULL,
    `token` CHAR(64) NOT NULL,
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `expires` DATE NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `selector_UNIQUE` (`selector` ASC),
    CONSTRAINT `fk_tuser_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `auth_tokens` (
    `user_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `token` CHAR(64) NOT NULL,
    `expires` DATETIME NOT NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE (`token`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `events_profiles` (
    `profile_id` SMALLINT UNSIGNED NOT NULL,
    `event_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`profile_id`, `event_id`),
    CONSTRAINT `fk_profile_id` FOREIGN KEY (`profile_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_event_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `events_venues` (
    `venue_id` SMALLINT UNSIGNED NOT NULL,
    `event_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`venue_id`, `event_id`),
    CONSTRAINT `fk_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vevent_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `venue_owner` (
    `venue_id` SMALLINT UNSIGNED NOT NULL,
    `user_id` SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (`venue_id`, `user_id`),
    CONSTRAINT `fk_ovenue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vuser_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

-- triggers

CREATE TRIGGER ins_event AFTER INSERT ON `events`
    FOR EACH ROW INSERT INTO events_isam (id, venue, `desc`, title, band) VALUES (new.id, new.venue, new.`desc`, new.title, new.band);
CREATE TRIGGER del_event AFTER DELETE ON `events`
    FOR EACH ROW DELETE FROM events_isam WHERE id=old.id;
CREATE TRIGGER upd_event AFTER UPDATE ON `events`
    FOR EACH ROW UPDATE events_isam SET venue=new.venue, `desc`=new.`desc`, title=new.title, band=new.band WHERE id=new.id;

CREATE TRIGGER ins_profile AFTER INSERT ON profiles
    FOR EACH ROW INSERT INTO profiles_isam (user_id, bio) VALUES (new.user_id, new.bio);
CREATE TRIGGER del_profile AFTER DELETE ON profiles
    FOR EACH ROW DELETE FROM profiles_isam WHERE user_id=old.user_id;
CREATE TRIGGER upd_profile AFTER UPDATE ON profiles
    FOR EACH ROW UPDATE profiles_isam SET bio=new.bio WHERE user_id=new.user_id;

CREATE TRIGGER ins_venue AFTER INSERT ON venues
    FOR EACH ROW INSERT INTO venues_isam (id, name, `desc`) VALUES (new.id, new.name, new.`desc`);
CREATE TRIGGER del_venue AFTER DELETE ON venues
    FOR EACH ROW DELETE FROM venues_isam WHERE id=old.id;
CREATE TRIGGER upd_venue AFTER UPDATE ON venues
    FOR EACH ROW UPDATE venues_isam SET name=new.name, `desc`=new.`desc` WHERE id=new.id;

-- stored procedures

DELIMITER $$
CREATE PROCEDURE get_events (sd DATE, ed DATE)
BEGIN
SELECT id, venue, start_time, end_time, title, DATE_FORMAT(`date`, '%Y-%m-%d') as `fdate` FROM `events`
WHERE `date` BETWEEN sd AND ed
ORDER BY start_time ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE get_profile (type VARCHAR(4), uid SMALLINT, uname VARCHAR(91))
BEGIN
IF type = 'id' THEN
SELECT user_id, name AS instr_name, bio, pic, links, CONCAT_WS(' ', first_name, last_name) AS name FROM
`profiles` JOIN users ON user_id=users.id JOIN instr ON instr.id=instr_id WHERE user_id=uid;
ELSEIF type = 'name' THEN
SELECT user_id, name AS instr_name, bio, pic, links, CONCAT_WS(' ', first_name, last_name) AS name FROM
`profiles` JOIN users ON user_id=users.id JOIN instr ON instr.id=instr_id WHERE CONCAT_WS(' ', first_name, last_name)=uname;
END IF;
END$$
DELIMITER ;
-- get all profiles ordered by number of instr users and name
DELIMITER $$
CREATE PROCEDURE get_profiles ()
BEGIN
SELECT CONCAT_WS(' ', first_name, last_name) AS name, instr.name as instr_name
FROM `profiles` JOIN instr ON instr_id=instr.id JOIN users ON user_id=users.id
JOIN ( SELECT name, COUNT(*) AS cnt FROM `profiles` JOIN instr ON instr_id=id GROUP BY name) c ON c.name=instr.name
ORDER BY c.cnt DESC, name ASC;
END$$
DELIMITER ;
-- get all venues ordered by number of events
DELIMITER $$
CREATE PROCEDURE get_venues ()
BEGIN
SELECT name, pic, venues.id, `desc`
FROM venues
LEFT OUTER JOIN ( SELECT venue_id, COUNT(*) AS cnt FROM `events_venues` JOIN venues ON venue_id=venues.id JOIN events ON event_id=events.id WHERE events.date >= CURDATE() GROUP BY venue_id) c ON c.venue_id=venues.id
ORDER BY c.cnt DESC, name ASC;
END $$
DELIMITER ;
-- Mass venue insert
DELIMITER $$
CREATE PROCEDURE mass_insert (club VARCHAR(60), _date DATE, _start CHAR(4), _end CHAR(4), _title VARCHAR(80), _id SMALLINT UNSIGNED, _band TEXT, _desc TEXT)
BEGIN
DECLARE _vid SMALLINT;
DECLARE _eid SMALLINT;
DECLARE _pid SMALLINT;
DECLARE dupe SMALLINT;
SELECT `events`.id INTO dupe FROM `events` WHERE LOWER(`events`.venue)=LOWER(club) AND `events`.start_time=_start AND `events`.date=_date;
IF dupe IS NULL THEN
    SELECT venues.id INTO _vid FROM venues WHERE club LIKE CONCAT('%', CONCAT(venues.name, '%')) LIMIT 1;
    INSERT INTO `events` (venue, date, start_time, end_time, title, user_id, band, `desc`) VALUES (club, _date, _start, _end, _title, _id, _band, _desc);
    SET _eid=LAST_INSERT_ID();
    IF _vid>=1 THEN
        INSERT INTO events_venues (venue_id, events_venues.event_id) VALUES (_vid, _eid);
    END IF;
    SELECT user_id INTO _pid FROM `profiles` WHERE user_id=_id;
END IF;
IF _pid>=1 THEN
    INSERT INTO events_profiles (events_profiles.event_id, profile_id) VALUES (_eid, _pid);
END IF;
END $$
DELIMITER ;
-- Create new event and associated event_venue if applicable
DELIMITER $$
CREATE PROCEDURE create_event (club VARCHAR(60), _date DATE, _start CHAR(4), _end CHAR(4), _title VARCHAR(80), _band TEXT, _id SMALLINT UNSIGNED, _desc TEXT, OUT eid SMALLINT)
BEGIN
DECLARE _vid SMALLINT;
DECLARE dupe SMALLINT;
SELECT `events`.id INTO dupe FROM `events` WHERE LOWER(`events`.venue)=LOWER(club) AND `events`.start_time=_start AND `events`.date=_date;
IF dupe IS NULL THEN
  SELECT venues.id INTO _vid FROM venues WHERE club LIKE CONCAT('%', CONCAT(venues.name, '%')) LIMIT 1;
  INSERT INTO `events` (venue, date, start_time, end_time, title, user_id, band, `desc`) VALUES (club, _date, _start, _end, _title, _id, _band, _desc);
  SET eid=LAST_INSERT_ID();
END IF;
IF _vid>=1 THEN
INSERT INTO events_venues (venue_id, events_venues.event_id) VALUES (_vid, eid);
END IF;
END $$
DELIMITER ;
-- Get event info for profile associated with given ID
DELIMITER $$
CREATE PROCEDURE get_profile_events (uid SMALLINT UNSIGNED)
BEGIN
SELECT `events`.id AS id, DATE_FORMAT(`date`, '%a. %M %D, %Y') AS edate, start_time, end_time, title, venue
FROM `events` JOIN events_profiles ON `events`.id=event_id
WHERE profile_id=uid AND `date` >= CURDATE()
ORDER BY `date` ASC, start_time ASC;
END $$
DELIMITER ;
-- get Log in info. also check for profile and venue ownership
DELIMITER $$
CREATE PROCEDURE log_in (user_email VARCHAR(80), OUT hasProfile SMALLINT, OUT numVenues SMALLINT, OUT venueId SMALLINT UNSIGNED)
BEGIN
    SELECT COUNT(*) INTO hasProfile FROM profiles JOIN users ON user_id=users.id WHERE email=user_email;
    SELECT COUNT(*) INTO numVenues FROM venue_owner JOIN users ON user_id=users.id WHERE email=user_email;
    IF numVenues=1 THEN
        SELECT venues.id INTO venueId FROM venues JOIN venue_owner ON venues.id = venue_owner.venue_id JOIN users ON venue_owner.user_id = users.id WHERE email=user_email;
    END IF;
    SELECT hasProfile, numVenues, venueId, pass, id, CONCAT_WS(' ', first_name, last_name) AS name, type FROM users WHERE email=user_email;
END $$
DELIMITER ;
-- get Log in info using user_id (instead of email) from RememberMe cookie
DELIMITER $$
CREATE PROCEDURE log_in_rm (uid SMALLINT UNSIGNED, OUT hasProfile SMALLINT, OUT numVenues SMALLINT, OUT venueId SMALLINT UNSIGNED)
    BEGIN
        SELECT COUNT(*) INTO hasProfile FROM profiles JOIN users ON user_id=users.id WHERE users.id=uid;
        SELECT COUNT(*) INTO numVenues FROM venue_owner JOIN users ON user_id=users.id WHERE users.id=uid;
        IF numVenues=1 THEN
            SELECT venues.id INTO venueId FROM venues JOIN venue_owner ON venues.id = venue_owner.venue_id JOIN users ON venue_owner.user_id = users.id WHERE users.id=uid;
        END IF;
        SELECT hasProfile, numVenues, venueId, pass, id, CONCAT_WS(' ', first_name, last_name) AS name, type FROM users WHERE users.id=uid;
    END $$
DELIMITER ;
-- Search function
DELIMITER $$
CREATE PROCEDURE search (search VARCHAR(39))
    BEGIN
        (SELECT MATCH(events_isam.title, events_isam.`desc`, events_isam.band, events_isam.venue) AGAINST(search) AS score, 'event' AS type,
        events_isam.id AS id, events_isam.title AS title, events_isam.`desc` AS `desc`, events_isam.venue AS venue, DATE_FORMAT(events.date, '%a. %M %D, %Y') AS `date`, events.start_time AS start, events.end_time AS `end`
        FROM events_isam JOIN events ON events_isam.id=events.id WHERE MATCH(events_isam.title, events_isam.`desc`, events_isam.band, events_isam.venue) AGAINST(search))
        UNION
        (SELECT MATCH(venues_isam.name, venues_isam.`desc`) AGAINST(search) AS score, 'venue',
        venues_isam.id, venues_isam.name, venues_isam.`desc`, NULL, NULL, NULL, NULL
        FROM venues_isam WHERE MATCH(venues_isam.name, venues_isam.`desc`) AGAINST(search))
        UNION
        (SELECT MATCH(profiles_isam.bio) AGAINST(search) AS score, 'profile',
        users.id, CONCAT_WS(' ', users.first_name, users.last_name), profiles_isam.bio, NULL, NULL, NULL, NULL
        FROM users JOIN profiles_isam ON users.id = profiles_isam.user_id
        WHERE MATCH(profiles_isam.bio) AGAINST(search))
        UNION
        (SELECT .5, 'profile', users.id, CONCAT_WS(' ', users.first_name, users.last_name), profiles.bio, NULL, NULL, NULL, NULL
        FROM users JOIN profiles ON users.id = profiles.user_id
        WHERE search LIKE CONCAT(CONCAT('%', users.first_name), '%') OR search LIKE CONCAT(CONCAT('%', users.last_name), '%'))
        ORDER BY score DESC, `date` DESC LIMIT 30;
    END $$
DELIMITER ;