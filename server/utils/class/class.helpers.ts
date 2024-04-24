// function to get the class name of an object
export function getClassName(obj: any): string {
  return obj.constructor.name;
}

// function to get the methods of a class
export function getMethods(obj: any): string[] {
  return Object.getOwnPropertyNames(obj).filter(
    (item) => typeof obj[item] === 'function',
  );
}

// function to get the method names of a class
export function getMethodNames(obj: any): string[] {
  return getMethods(obj).map((method) => obj[method].name);
}
