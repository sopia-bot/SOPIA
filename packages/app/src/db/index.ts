import { DataSource } from "typeorm";
import { app } from 'electron';
import { join } from 'node:path';
import { User } from "./entities/user";

const basedir = app.getPath('userData');

const AppDataSource = new DataSource({
	type: 'better-sqlite3',
	database: join(basedir, 'app.db'),
	entities: [User],
	logging: true,
	synchronize: true,
	logger: new Logger('Database'),
});

export function AppDataInitialize() {
	AppDataSource.initialize();
}