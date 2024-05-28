import fs from 'fs/promises';
import xlsx from 'node-xlsx';

export class XLSXParser {
  async loadData(filePath: string) {
    const fileBuffer = await fs.readFile(filePath);
    const workSheetsFromFile = xlsx.parse(fileBuffer, { skipHidden: true, defval: '', blankrows: false });
    return workSheetsFromFile;
  }
}
