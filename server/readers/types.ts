import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { basename, resolve } from 'path';

export enum ObjectType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  INDEX = 'INDEX',
  DOCUMENT = 'DOCUMENT',
  IMAGE_DOCUMENT = 'IMAGE_DOCUMENT',
}

export type Metadata = Record<string, any>;

export type BaseNodeParams<T extends Metadata = Metadata> = {
  id_?: string | undefined;
  metadata?: T | undefined;
};

export type TextNodeParams<T extends Metadata = Metadata> = BaseNodeParams<T> & {
  text?: string | undefined;
};

/**
 * A document is just a special text node with a docId.
 */
export class Document<T extends Metadata = Metadata> {
  id_: string;
  text: string;
  metadata: T;

  constructor(init: TextNodeParams<T> = {}) {
    const { id_, metadata } = init || {};
    this.id_ = id_ ?? randomUUID();
    this.text = init.text ?? '';
    this.metadata = metadata ?? ({} as T);
  }

  get type() {
    return ObjectType.DOCUMENT;
  }
}

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: unknown[]): Promise<Document[]>;
}

/**
 * A FileReader takes file paths and imports data into Document objects.
 */
export abstract class FileReader implements BaseReader {
  abstract loadDataAsContent(fileContent: Uint8Array, fileName?: string): Promise<Document[]>;

  async loadData(filePath: string): Promise<Document[]> {
    const fileContent = await readFile(filePath);
    const fileName = basename(filePath);
    const docs = await this.loadDataAsContent(fileContent, fileName);
    docs.forEach(FileReader.addMetaData(filePath));
    return docs;
  }

  static addMetaData(filePath: string) {
    return (doc: Document, index: number) => {
      // generate id as loadDataAsContent is only responsible for the content
      doc.id_ = `${filePath}_${index + 1}`;
      doc.metadata['file_path'] = resolve(filePath);
      doc.metadata['file_name'] = basename(filePath);
    };
  }
}
