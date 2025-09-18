import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LlamaService {
    private readonly logger = new Logger(LlamaService.name);
    private readonly llamaUrl = process.env.LLAMA_URL || 'http://localhost:11434';

    async generateResponse(
        query: string,
        context: string,
        onToken?: (token: string) => void
    ): Promise<string> {
        try {
            const prompt = this.buildPrompt(query, context);

            const response = await axios.post(
                `${this.llamaUrl}/api/generate`,
                {
                    model: 'llama3',
                    prompt,
                    stream: true,
                },
                {
                    responseType: 'stream',
                }
            );

            let fullResponse = '';

            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk: Buffer) => {
                    const lines = chunk.toString().split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);

                            if (data.response) {
                                fullResponse += data.response;
                                onToken?.(data.response);
                            }

                            if (data.done) {
                                resolve(fullResponse);
                            }
                        } catch (parseError) {
                        }
                    }
                });

                response.data.on('error', (error: any) => {
                    this.logger.error('Llama stream error', error);
                    reject(error);
                });

                response.data.on('end', () => {
                    if (fullResponse) {
                        resolve(fullResponse);
                    }
                });
            });
        } catch (error) {
            this.logger.error('Failed to generate response with Llama', error);
            throw new Error('Failed to generate response');
        }
    }

    private buildPrompt(query: string, context: string): string {
        return `Você é um assistente útil e amigável que responde perguntas baseadas no contexto fornecido.

CONTEXTO:
${context}

PERGUNTA DO USUÁRIO:
${query}

INSTRUÇÕES:
- Responda de forma clara, amigável e útil
- Base sua resposta apenas no contexto fornecido
- Se a pergunta não puder ser respondida com o contexto disponível, diga isso educadamente
- Seja conciso mas completo
- Use um tom conversacional e acolhedor

RESPOSTA:`;
    }
}