import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

export class CSVParser {
  async loadData(filePath: string) {
    const fileBuffer = await fs.readFile(filePath);

    try {
      const records = parse(fileBuffer, {
        delimiter: ';',
        columns: false,
        skip_empty_lines: true,
      });
      return records;
    } catch (error) {
      console.error('Error parsing CSV file, Error is: ', error);
      throw error;
    }
  }
}
