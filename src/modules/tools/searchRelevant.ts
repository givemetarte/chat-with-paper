import { createEmbedding } from "./createEmbedding";
import { SimpleVectorDB } from './simpleVectorDB'; // Import the class

export async function searchRelevantContext(db: SimpleVectorDB, question: string): Promise<string> {
  const questionEmbedding = await createEmbedding(question);
  const relevantChunks = db.search(questionEmbedding);
  return relevantChunks.join(" ");
}