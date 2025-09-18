import { Module } from '@nestjs/common';
import { DocumentModule } from './modules/document/document.module';
import { ChatModule } from './modules/chat/chat.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [DocumentModule, ChatModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),],
})
export class AppModule { }