import fs from 'fs-extra';
import { parse } from 'csv-parse/sync';

export class CSVParser {
  async loadData(filePath: string) {
    const fileBuffer = await fs.readFile(filePath);

    const records = parse(fileBuffer, {
      bom: true,
      delimiter: ',',
      columns: false,
      skipEmptyLines: true,
    });

    return { data: records };
  }
}
