import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
      load: [() => configuration],
    }),
  ],
})
export class TestModule {}
