import * as fs from 'fs';
import * as path from 'path';
import {Delta} from "jsondiffpatch";

interface HasId {
  id: string;
}

export class ObjectFileStorage<T extends HasId> {
  constructor(private readonly folderPath: string) {

  }

  load(): T[] {
    const objects = fs.readdirSync(this.folderPath).map(filename => {
      const completeFilename = path.join(this.folderPath, filename);
      return JSON.parse(fs.readFileSync(completeFilename, 'utf8')) as T;
    });
    return objects;
  }

  saveIfChanged(objects: T[], delta?: Delta) {
    if (!delta || delta._t !== 'a') {
      return;
    }

    console.log('delta', JSON.stringify(delta, null, 2));

    for (const indexString in delta) {
      if (isInteger(indexString)) {
        const index = parseInt(indexString, 10);
        this.saveObject(objects[index]);
      }
    }
  }

  private saveObject(object: T) {
    console.log('saveObject', object.id);
    const completeFilename = path.join(this.folderPath, object.id + '.json');
    fs.writeFileSync(completeFilename, JSON.stringify(object), 'utf8');
  }

}


function isInteger(s: string) {
  return /^\d+$/.test(s);
}
