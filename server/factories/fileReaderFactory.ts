import {
  PDFReader,
  DocxReader,
  MarkdownReader,
  PapaCSVReader as CSVReader,
  TextFileReader,
  HTMLReader,
} from 'llamaindex';
import type { FileReader } from 'llamaindex';
import { FileType } from '~/server/utils/enums/file-type.enum';

export class FileReaderFactory {
  type: string;
  reader: FileReader;

  constructor(type: string) {
    this.type = type;
    this.reader = this.getReader();
  }

  loadData(filePath: string) {
    return this.reader.loadData(filePath);
  }

  getReader() {
    switch (this.type) {
      case FileType.TXT:
        return new TextFileReader();
      case FileType.PDF:
        return new PDFReader();
      case FileType.DOCX:
        return new DocxReader();
      case FileType.MARKDOWN:
        return new MarkdownReader();
      case FileType.CSV:
        return new CSVReader();
      case FileType.HTML:
        return new HTMLReader();
      default:
        throw new Error(`Unsupported file type: ${this.type}`);
    }
  }
}
