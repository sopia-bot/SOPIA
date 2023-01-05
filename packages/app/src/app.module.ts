import { Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { AppModule as ApplicationModule } from './app/app.module';
import { SpoonModule } from './spoon/spoon.module';

@Module({
	imports: [ GlobalModule, ApplicationModule, SpoonModule ],
})
export class AppModule {}
