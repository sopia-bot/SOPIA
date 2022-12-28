import { DataSource } from "typeorm";
import { app } from 'electron';
import { join } from 'node:path';
import { SpoonUser } from "./entities/SpoonUser";

const basedir = app.getPath('userData');

const AppDataSource = new DataSource({
	type: 'better-sqlite3',
	database: join(basedir, 'app.db'),
	entities: [SpoonUser],
	logging: true,
});

export function AppDataInitialize() {
	AppDataSource.initialize();
}