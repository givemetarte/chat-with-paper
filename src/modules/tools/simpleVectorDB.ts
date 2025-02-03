interface VectorEntry {
  text: string;
  embedding: number[];
}

class SimpleVectorDB {
  entries: VectorEntry[] = [];

  add(text: string, embedding: number[]) {
      this.entries.push({ text, embedding });
  }

  // 캐시에 저장하기 위한 데이터 준비
  toCache(): { entries: VectorEntry[] } {
      return {
          entries: this.entries
      };
  }

  // 캐시에서 데이터 로드
  loadFromCache(data: { entries: VectorEntry[] }) {
      this.entries = data.entries;
  }

  search(queryEmbedding: number[], topK: number = 3): string[] {
      const scored = this.entries.map(entry => ({
          text: entry.text,
          score: this.cosineSimilarity(queryEmbedding, entry.embedding)
      }));
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, topK).map(s => s.text);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
      const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dotProduct / (magnitudeA * magnitudeB);
  }
}

export { SimpleVectorDB };  // 클래스를 export
export const vectorDB = new SimpleVectorDB();  // 인스턴스도 export