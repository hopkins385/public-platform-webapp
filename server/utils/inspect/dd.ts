import { inspect } from './inspect';
/**
 * This function is used to dump the data passed to it and then exit the process.
 * @param args
 */
export function dd(args: any, options: { exit: boolean } = { exit: false }) {
  Array.prototype.slice.call(arguments).forEach((thing) => {
    console.log(inspect(thing));
  });
  if (!options.exit) {
    throw new Error('dd() called');
  } else {
    process.exit(1);
  }
}
