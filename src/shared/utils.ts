export function assertUnreachable(x: never): never {
  throw new Error('Didn\'t expect to get here');
}

interface HasId {
  id: string;
}

export function hasId<T extends HasId>(id: string) {
    return (object: T) => object.id === id;
}