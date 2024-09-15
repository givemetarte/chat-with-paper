export function splitTextIntoChunks(text: string, chunkSize: number = 1000): string[] {
  if (!text) {
    return [];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);
    startIndex = endIndex;
  }

  ztoolkit.log("Text chunks:", chunks);
  return chunks;
}