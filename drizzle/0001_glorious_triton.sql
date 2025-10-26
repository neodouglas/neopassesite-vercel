CREATE TABLE `accountQueries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`uid` varchar(64) NOT NULL,
	`nickname` text,
	`level` int,
	`xp` int,
	`accountId` varchar(64),
	`queriedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountQueries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accountQueries` ADD CONSTRAINT `accountQueries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;