import { FileType } from '~/server/utils/enums/file-type.enum';
import { PDFReader } from '../readers/PDFReader';
import { DocxReader } from '../readers/DocxReader';
import { PapaCSVReader } from '../readers/CSVReader';
import { TextFileReader } from '../readers/TextFileReader';
import type { FileReader } from '../readers/types';

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
        throw new Error('Not implemented');
      case FileType.CSV:
        return new PapaCSVReader();
      case FileType.HTML:
        throw new Error('Not implemented');
      default:
        throw new Error(`Unsupported file type: ${this.type}`);
    }
  }
}
