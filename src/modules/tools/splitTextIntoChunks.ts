export function splitTextIntoChunks(text: string, chunkSize: number = 1024, overlapSize: number = 200): string[] {

  if (!text) {
    return [];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);
    startIndex += (chunkSize - overlapSize); 
  }

  ztoolkit.log("Text chunks:", chunks);
  return chunks;
}