import * as path from 'path';
import * as fs from 'fs';
import { ParsedDocument } from './layoutReader';

class LayoutPDFReader {
  constructor(private parserApiUrl: string) {}

  private async _parseFile(payloadFile: [string, Buffer, string]): Promise<any> {
    const formData = new FormData();
    formData.append('file', new Blob([payloadFile[1]], { type: payloadFile[2] }), payloadFile[0]);

    const response = await this.apiConnection.post(this.parserApiUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  }

  async readPdf(pathOrUrl: string, contents?: Buffer): Promise<ParsedDocument> {
    let pdfFile: [string, Buffer, string];

    if (contents) {
      pdfFile = [path.basename(pathOrUrl), contents, 'application/pdf'];
    } else {
      const fileName = path.basename(pathOrUrl);
      const fileData = await fs.promises.readFile(pathOrUrl);
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
