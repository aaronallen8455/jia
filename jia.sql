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
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC),
    INDEX `login` (`email` ASC, `pass` ASC)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `profiles` (
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `instr_id` TINYINT UNSIGNED NOT NULL,
    `bio` TEXT NOT NULL,
    `pic` VARCHAR(100) NULL,
    `links` TINYTEXT NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_user_id`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`),
    CONSTRAINT `fk_instr_id`
        FOREIGN KEY (`instr_id`)
        REFERENCES `instr` (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `events` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `venue` VARCHAR(80) NOT NULL,
    `date` DATE NOT NULL,
    `start_time` CHAR(4) NOT NULL,
    `end_time` CHAR(4) NOT NULL,
    `desc` TEXT NULL,
    `title` VARCHAR(80) NOT NULL,
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `band` TEXT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_user_id`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `venues` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `desc` TEXT NOT NULL,
    `pic` VARCHAR(100) NULL,
    `links` TINYTEXT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `instr` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `rm_tokens` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `selector` CHAR(12) NOT NULL,
    `token` CHAR(64) NOT NULL,
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `expires` DATE NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `selector_UNIQUE` (`selector` ASC),
    CONSTRAINT `fk_tuser_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `auth_tokens` (
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `events_profiles` (
    `profile_id` SMALLINT UNSIGNED NOT NULL,
    `event_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`profile_id`, `event_id`),
    CONSTRAINT `fk_profile_id` FOREIGN KEY (`profile_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_event_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `events_venues` (
    `venue_id` SMALLINT UNSIGNED NOT NULL,
    `event_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`venue_id`, `event_id`),
    CONSTRAINT `fk_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`),
    CONSTRAINT `fk_vevent_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

-- stored procedures

DELIMITER $$
CREATE PROCEDURE get_events (sd DATE, ed DATE)
BEGIN
SELECT id, venue, start_time, end_time, title, DATE_FORMAT(`date`, '%Y-%m-%d') as `fdate` FROM `events`
WHERE `date` BETWEEN sd AND ed
ORDER BY start_time ASC;
END$$
DELIMITER ;

