import { ulid } from 'ulidx';

export function ULID() {
  return ulid().toLocaleLowerCase();
}
