USE `jia`;

CREATE TABLE `users` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(45) NOT NULL,
    `last_name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(80) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `type` CHAR(1) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC),
    INDEX `login` (`email` ASC, `pass` ASC)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `profiles` (
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `instr_id` TINYINT UNSIGNED NOT NULL,
    `bio` LONGTEXT NOT NULL,
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
    `desc` LONGTEXT NULL,
    `title` VARCHAR(80) NOT NULL,
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_user_id`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `venues` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `desc` LONGTEXT NOT NULL,
    `pic` VARCHAR(100) NULL,
    `links` TINYTEXT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `instr` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC)
)

-- stored procedures

DELIMITER $$
CREATE PROCEDURE get_events (sd DATE, ed DATE)
BEGIN
SELECT id, venue, start_time, end_time, title, DATE_FORMAT(`date`, '%Y-%m-%d') as `fdate` FROM `events`
WHERE `date` BETWEEN sd AND ed
ORDER BY start_time ASC;
END$$
DELIMITER ;

