export enum RoleEnum {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum RoleMapEnum {
  OWNER = 1,
  EDITOR = 2,
  VIEWER = 3,
}

export function getRoleEnumValue(key: string): number {
  if (typeof key !== 'string') {
    throw new Error(`Expected key to be a string, but received ${typeof key}`);
  }

  const res = RoleMapEnum[key.toUpperCase() as keyof typeof RoleEnum];

  if (!res) {
    throw new Error(`Invalid role: ${key}`);
  }

  return res;
}
