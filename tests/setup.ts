import { existsSync } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { dirname, join } from 'pathe';

const url = import.meta.url;
const dir = dirname(fileURLToPath(url));
const componentsDir = join(dir, 'components');
const tempDir = join(dir, 'components-temp');

export async function setup() {
  //
}

export async function teardown() {
  //
}
