import { Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { TestModule } from './test/test.module';
import { AppModule as ApplicationModule } from './app/app.module';
import { SpoonModule } from './spoon/spoon.module';

@Module({
	imports: [ TestModule, GlobalModule, ApplicationModule, SpoonModule ],
})
export class AppModule {}
