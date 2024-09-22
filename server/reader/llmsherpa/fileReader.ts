import * as path from 'path';
import * as fs from 'fs';
import { ParsedDocument } from './layoutReader';

class LayoutPDFReader {
  constructor(private parserApiUrl: string) {}

  private async _parseFile(payloadFile: [string, Buffer, string]): Promise<any> {
    const formData = new FormData();
    formData.append('file', new Blob([payloadFile[1]], { type: payloadFile[2] }), payloadFile[0]);

    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    try {
      const response = await fetch(this.parserApiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('error:', e);
      return null;
    }
  }

  async readPdf(payload: { path: string; contents?: Buffer }): Promise<ParsedDocument> {
    let pdfFile: [string, Buffer, string];

    if (payload.contents) {
      pdfFile = [path.basename(payload.path), payload.contents, 'application/pdf'];
    } else {
      const fileName = path.basename(payload.path);
      const fileData = await fs.promises.readFile(payload.path);
      pdfFile = [fileName, fileData, 'application/pdf'];
    }

    const parserResponse = await this._parseFile(pdfFile);
    if (parserResponse.status > 200) {
      throw new Error(`${parserResponse.data}`);
    }

    const blocks = parserResponse.return_dict.result.blocks;
    return new ParsedDocument(blocks);
  }
}

export default LayoutPDFReader;
