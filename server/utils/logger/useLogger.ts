import consola from 'consola';

export default function useLogger(name: string) {
  const logger = consola.create({}).withTag(name);
  return logger;
}
