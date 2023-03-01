import { Module } from '@nestjs/common';
import { TelegramController } from './app.controller';
import { TelegramService } from './app.service';

@Module({
  imports: [],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class AppModule {}
