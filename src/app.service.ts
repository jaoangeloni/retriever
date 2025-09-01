import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";
import { Injectable } from '@nestjs/common';
import axios from "axios";
import { CloudClient } from 'chromadb';

@Injectable()
export class AppService {
  async teste() {
    try {
      const client = new CloudClient({
        tenant: process.env.CHROMA_TENANT,
        database: process.env.CHROMA_DATABASE,
        apiKey: process.env.CHROMA_API_KEY,
      });

      const embedder = new DefaultEmbeddingFunction({
        modelName: 'Xenova/all-MiniLM-L6-v2',
        revision: 'main',
        dtype: 'q8',
        wasm: false,
      })

      const teste = await axios.post("http://localhost:11434/api/chat", {
        model: "llama3.1:8b",
        messages: [
          { role: "user", content: "Resuma a teoria da relatividade em 3 linhas" }
        ]
      }, { timeout: 0 }).then(res => res.data);

      return teste;
    } catch (err) {
      console.log(err)
    }
  }
}
