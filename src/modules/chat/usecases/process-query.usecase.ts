import { Injectable, Logger } from '@nestjs/common';
import { ChromaDbService } from '../../document/services/chromadb.service';
import { LlamaService } from '../services/llama.service';
import { ChatResponse } from '../entities/chat-response.entity';

@Injectable()
export class ProcessQueryUseCase {
    private readonly logger = new Logger(ProcessQueryUseCase.name);

    constructor(
        private readonly vectorStore: ChromaDbService,
        private readonly llamaService: LlamaService,
    ) { }

    async execute(
        query: string,
        sessionId: string,
        onToken?: (token: string) => void
    ): Promise<ChatResponse> {
        try {
            this.logger.log(`Processing query for session ${sessionId}: ${query.substring(0, 100)}...`);

            const relevantChunks = await this.vectorStore.similaritySearch(query, 5);

            this.logger.log(`Found ${relevantChunks.length} relevant chunks`);

            const context = relevantChunks
                .map(chunk => chunk.content)
                .join('\n\n');

            let fullResponse = '';

            const response = await this.llamaService.generateResponse(
                query,
                context,
                (token: string) => {
                    fullResponse += token;
                    onToken?.(token);
                }
            );

            const chatResponse = new ChatResponse(
                this.generateId(),
                response || fullResponse,
                relevantChunks,
                new Date(),
                true
            );

            this.logger.log(`Generated response for session ${sessionId}`);

            return chatResponse;
        } catch (error) {
            this.logger.error('Failed to process query', error);
            throw error;
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
