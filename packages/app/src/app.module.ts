import { Module, Logger as NestLogger } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { AppModule as ApplicationModule } from './app/app.module';
import { SpoonModule } from './spoon/spoon.module';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { app } from 'electron';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import { UserEntity } from './db/entities/user.entity';

const basedir = app.getPath('userData');

class NestOrmLogger implements TypeOrmLogger {
	private logger = new NestLogger('DataBase');

	log(level: 'log'|'info'|'warn', message: any) {
		switch (level) {
			case 'log': this.logger.log(message); return;
			case 'info': this.logger.log(message); return;
			case 'warn': this.logger.warn(message); return;
		}
		this.logger.debug(message);
	}

	logMigration(message: string, queryRunner?: QueryRunner | undefined) {
		this.logger.debug(message);
	}

	logQuery(query: string, parameters?: any[] | undefined, queryRunner?: QueryRunner | undefined) {
		this.logger.debug(query, parameters);
	}

	logQueryError(error: string | Error, query: string, parameters?: any[] | undefined, queryRunner?: QueryRunner | undefined) {
		this.logger.error(error, query, parameters);
	}

	logQuerySlow(time: number, query: string, parameters?: any[] | undefined, queryRunner?: QueryRunner | undefined) {
		this.logger.warn(time, query, parameters);
	}

	logSchemaBuild(message: string, queryRunner?: QueryRunner | undefined) {
		this.logger.debug(message);
	}

}

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'better-sqlite3',
			database: join(basedir, 'app.db'),
			entities: [UserEntity],
			logging: true,
			synchronize: true,
			logger: new NestOrmLogger(),
		}),
		GlobalModule,
		ApplicationModule,
		SpoonModule,
		ConfigModule,
	],
})
export class AppModule {}
