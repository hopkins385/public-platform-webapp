import { RagDocument, FileReader } from './types';
import mammoth from 'mammoth';

export class DocxReader extends FileReader {
  /** DocxParser */
  async loadDataAsContent(fileContent: Uint8Array): Promise<RagDocument[]> {
    // Note: await mammoth.extractRawText({ arrayBuffer: fileContent });  is not working
    // So we need to convert to Buffer first
    const buffer = Buffer.from(fileContent);
    const { value } = await mammoth.extractRawText({ buffer });
    return [new RagDocument({ text: value })];
  }
}
