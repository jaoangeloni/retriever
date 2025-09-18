import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ProcessQueryUseCase } from './usecases/process-query.usecase';
import { LlamaService } from './services/llama.service';
import { DocumentModule } from '../document/document.module';

@Module({
    imports: [DocumentModule],
    providers: [ChatGateway, ProcessQueryUseCase, LlamaService],
})
export class ChatModule { }