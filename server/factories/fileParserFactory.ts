import {
  PDFReader,
  DocxReader,
  MarkdownReader,
  PapaCSVReader as CSVReader,
  TextFileReader,
  HTMLReader,
} from 'llamaindex';
import type { FileReader } from 'llamaindex';

export class FileParserFactory {
  type: string;
  filePath: string;
  reader: FileReader;

  constructor(type: string, filePath: string) {
    this.type = type;
    this.filePath = filePath;
    this.reader = this.getReader();
  }

  loadData() {
    return this.reader.loadData(this.filePath);
  }

  getReader() {
    switch (this.type) {
      case 'txt':
      case 'plain':
        return new TextFileReader();
      case 'pdf':
        return new PDFReader();
      case 'docx':
        return new DocxReader();
      case 'md':
        return new MarkdownReader();
      case 'csv':
        return new CSVReader();
      case 'html':
        return new HTMLReader();
      default:
        throw new Error(`Unsupported file type: ${this.type}`);
    }
  }
}
