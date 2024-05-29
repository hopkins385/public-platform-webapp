import * as util from 'util';

export function inspect(thing: any) {
  return util.inspect(thing, {
    showHidden: true,
    depth: null,
    colors: true,
  });
}
